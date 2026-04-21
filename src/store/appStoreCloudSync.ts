'use client'

import type {
  CoverageRule,
  Incident,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { HistoryEvent } from '@/domain/history/types'
import { useAccessStore } from './useAccessStore'
import {
  extractWeeklyPlansFromHistoryEvents,
  loadFromSupabase,
  syncAll,
} from '@/persistence/supabase-sync'
import type { CloudSnapshot } from '@/persistence/supabase-sync'
import {
  getPendingQueueSummary,
  isBrowserOffline,
} from '@/persistence/supabase-sync-runtime'
import type { CloudSyncStatus } from './useCloudSyncStore'
import { useSyncHealthStore } from './useSyncHealthStore'

type CloudStateSlice = {
  representatives: Representative[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
  historyEvents: HistoryEvent[]
}

type CloudAccessState = {
  status: ReturnType<typeof useAccessStore.getState>['status']
  canEditData: boolean
  dataOwnerUserId: string | null
}

type ReadyCloudAccessState = CloudAccessState & {
  status: 'ready'
  dataOwnerUserId: string
}

export type AppStoreCloudCapabilities = CloudStateSlice & {
  isLoading: boolean
  triggerCloudSync: () => Promise<void>
}

let hasCloudSyncWatcher = false
let activeCloudSync: Promise<void> | null = null
let shouldRerunCloudSync = false
let watchedCloudSignature: string | null = null
let lastSyncedCloudSignature: string | null = null

const REMOTE_REFRESH_INTERVAL_MS = 15000

function describeCloudSyncError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const message =
      'message' in error ? String((error as { message?: unknown }).message ?? '') : ''
    const code =
      'code' in error ? String((error as { code?: unknown }).code ?? '') : ''

    return [code, message].filter(Boolean).join(' - ') || 'Error desconocido'
  }

  return String(error ?? 'Error desconocido')
}

function getSharedAccessState() {
  const accessState = useAccessStore.getState()

  return {
    status: accessState.status,
    canEditData: accessState.canEditData,
    dataOwnerUserId: accessState.dataOwnerUserId,
  }
}

export function hasReadyCloudAccess(
  accessState: CloudAccessState
): accessState is ReadyCloudAccessState {
  return accessState.status === 'ready' && Boolean(accessState.dataOwnerUserId)
}

async function readPendingSummaryForUser(userId?: string) {
  return getPendingQueueSummary(userId)
}

type CloudComparableData = {
  representatives: Representative[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
  weeklyPlans: WeeklyPlan[]
}

export type ApplyCloudSnapshot = (snapshot: CloudSnapshot) => void

export function buildCloudPlanHistoryEvents(
  weeklyPlans: WeeklyPlan[]
): HistoryEvent[] {
  return [...weeklyPlans]
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart))
    .map(plan => ({
      id: `hist-cloud-plan-${plan.weekStart}`,
      timestamp: `${plan.weekStart}T12:00:00.000Z`,
      category: 'PLANNING' as const,
      title: 'Plan semanal sincronizado',
      description: 'Importado desde Supabase',
      metadata: {
        weeklyPlan: plan,
        source: 'SUPABASE',
      },
    }))
}

export function mergeCloudPlanningHistory(
  historyEvents: HistoryEvent[],
  weeklyPlans: WeeklyPlan[]
): HistoryEvent[] {
  const nonPlanningHistory = historyEvents.filter(
    event => event.category !== 'PLANNING'
  )

  return [...nonPlanningHistory, ...buildCloudPlanHistoryEvents(weeklyPlans)]
}

function compareByString<T>(selector: (item: T) => string) {
  return (left: T, right: T) => selector(left).localeCompare(selector(right))
}

function normalizeComparableData(
  data: CloudComparableData
): CloudComparableData {
  return {
    representatives: [...data.representatives].sort((left, right) => {
      const orderDelta = (left.orderIndex ?? 0) - (right.orderIndex ?? 0)

      if (orderDelta !== 0) return orderDelta
      return left.id.localeCompare(right.id)
    }),
    incidents: [...data.incidents].sort((left, right) => {
      const dateDelta = left.startDate.localeCompare(right.startDate)

      if (dateDelta !== 0) return dateDelta
      return left.id.localeCompare(right.id)
    }),
    swaps: [...data.swaps].sort((left, right) => {
      const dateDelta = left.date.localeCompare(right.date)

      if (dateDelta !== 0) return dateDelta
      return left.id.localeCompare(right.id)
    }),
    coverageRules: [...data.coverageRules].sort(compareByString(rule => rule.id)),
    weeklyPlans: [...data.weeklyPlans].sort(compareByString(plan => plan.weekStart)),
  }
}

function computeCloudDataSignature(data: CloudComparableData): string {
  return JSON.stringify(normalizeComparableData(data))
}

function recordCloudSignature(signature: string) {
  watchedCloudSignature = signature
  lastSyncedCloudSignature = signature
}

function resetCloudSignatures() {
  watchedCloudSignature = null
  lastSyncedCloudSignature = null
}

export function computeCloudSignature(state: CloudStateSlice): string {
  return computeCloudDataSignature({
    representatives: state.representatives,
    incidents: state.incidents,
    swaps: state.swaps,
    coverageRules: state.coverageRules,
    weeklyPlans: extractWeeklyPlansFromHistoryEvents(state.historyEvents),
  })
}

export function computeCloudSnapshotSignature(snapshot: CloudSnapshot): string {
  return computeCloudDataSignature(snapshot)
}

function hasLocalCloudData(state: CloudStateSlice): boolean {
  return (
    state.representatives.length > 0 ||
    state.incidents.length > 0 ||
    state.swaps.length > 0 ||
    state.coverageRules.length > 0 ||
    extractWeeklyPlansFromHistoryEvents(state.historyEvents).length > 0
  )
}

export function hasCloudSnapshotData(snapshot: CloudSnapshot): boolean {
  return (
    snapshot.representatives.length > 0 ||
    snapshot.incidents.length > 0 ||
    snapshot.swaps.length > 0 ||
    snapshot.coverageRules.length > 0 ||
    snapshot.weeklyPlans.length > 0
  )
}

export function shouldHydrateFromCloud(args: {
  localHasData: boolean
  remoteHasData: boolean
  pendingOperations: number
  localSignature: string
  remoteSignature: string
}): boolean {
  const {
    localHasData,
    remoteHasData,
    pendingOperations,
    localSignature,
    remoteSignature,
  } = args

  if (pendingOperations > 0) return false
  if (!remoteHasData) return false
  // Boot hydration must stay conservative: local data may include unsynced
  // edits from a prior online failure that never entered the pending queue.
  if (localHasData) return false

  return localSignature !== remoteSignature
}

export function shouldApplyRemoteRefresh(args: {
  pendingOperations: number
  localSignature: string
  lastSyncedSignature: string | null
  remoteSignature: string
  remoteHasData: boolean
}): boolean {
  const {
    pendingOperations,
    localSignature,
    lastSyncedSignature,
    remoteSignature,
    remoteHasData,
  } = args

  if (pendingOperations > 0) return false
  if (!remoteHasData) return false
  if (!lastSyncedSignature) return false
  if (localSignature !== lastSyncedSignature) return false

  return remoteSignature !== lastSyncedSignature
}

async function executeCloudSync(
  getState: () => AppStoreCloudCapabilities,
  setCloudStatus: (status: CloudSyncStatus) => void
): Promise<void> {
  const syncHealth = useSyncHealthStore.getState()

  try {
    const accessState = getSharedAccessState()
    const initialPendingSummary = await readPendingSummaryForUser(
      accessState.dataOwnerUserId ?? undefined
    )

    syncHealth.setPendingSummary(initialPendingSummary)

    if (!hasReadyCloudAccess(accessState)) {
      setCloudStatus('unauthenticated')
      syncHealth.markCloudUnauthenticated(initialPendingSummary)
      return
    }

    if (!accessState.canEditData) {
      setCloudStatus('synced')
      syncHealth.markCloudSuccess(initialPendingSummary)
      return
    }

    setCloudStatus('syncing')
    syncHealth.markCloudAttempt()

    const result = await syncAll(getState(), accessState.dataOwnerUserId)
    const pendingSummary = await readPendingSummaryForUser(
      accessState.dataOwnerUserId
    )

    if (result.success) {
      recordCloudSignature(computeCloudSignature(getState()))
      setCloudStatus('synced')
      syncHealth.markCloudSuccess(pendingSummary)
    } else if (result.error === 'offline_pending_sync') {
      setCloudStatus('offline')
      syncHealth.markCloudFailure('offline', null, pendingSummary)
    } else {
      setCloudStatus('error')
      syncHealth.markCloudFailure(
        'error',
        result.error ?? 'unexpected_sync_error',
        pendingSummary
      )
    }
  } catch (error) {
    console.warn(
      '[Cloud Sync] No se pudo sincronizar con Supabase:',
      describeCloudSyncError(error)
    )
    setCloudStatus('error')
    syncHealth.markCloudFailure(
      'error',
      describeCloudSyncError(error),
      await readPendingSummaryForUser()
    )
  }
}

export async function runCloudSync(
  getState: () => AppStoreCloudCapabilities,
  setCloudStatus: (status: CloudSyncStatus) => void
): Promise<void> {
  if (activeCloudSync) {
    shouldRerunCloudSync = true
    return activeCloudSync
  }

  activeCloudSync = executeCloudSync(getState, setCloudStatus)

  try {
    await activeCloudSync
  } finally {
    activeCloudSync = null

    if (shouldRerunCloudSync) {
      shouldRerunCloudSync = false
      return runCloudSync(getState, setCloudStatus)
    }
  }
}

export async function loadCloudSnapshotIfNeeded(
  state: CloudStateSlice
): Promise<CloudSnapshot | null> {
  if (isBrowserOffline()) {
    return null
  }

  const accessState = getSharedAccessState()

  if (!hasReadyCloudAccess(accessState)) {
    resetCloudSignatures()
    return null
  }

  const pendingSummary = await readPendingSummaryForUser(
    accessState.dataOwnerUserId
  )
  useSyncHealthStore.getState().setPendingSummary(pendingSummary)

  const remoteSnapshot = await loadFromSupabase(accessState.dataOwnerUserId)
  const localSignature = computeCloudSignature(state)
  const remoteSignature = computeCloudSnapshotSignature(remoteSnapshot)
  const localHasData = hasLocalCloudData(state)
  const remoteHasData = hasCloudSnapshotData(remoteSnapshot)

  if (!remoteHasData && !localHasData) {
    recordCloudSignature(localSignature)
    return null
  }

  if (
    shouldHydrateFromCloud({
      localHasData,
      remoteHasData,
      pendingOperations: pendingSummary.operations,
      localSignature,
      remoteSignature,
    })
  ) {
    recordCloudSignature(remoteSignature)
    return remoteSnapshot
  }

  if (
    pendingSummary.operations === 0 &&
    remoteHasData &&
    localSignature === remoteSignature
  ) {
    recordCloudSignature(remoteSignature)
  }

  return null
}

async function refreshCloudSnapshotIfNeeded(
  getState: () => AppStoreCloudCapabilities,
  applyCloudSnapshot: ApplyCloudSnapshot,
  setCloudStatus: (status: CloudSyncStatus) => void
): Promise<void> {
  if (isBrowserOffline() || activeCloudSync) {
    return
  }

  try {
    const accessState = getSharedAccessState()

    if (!hasReadyCloudAccess(accessState)) {
      resetCloudSignatures()
      const emptySummary = await readPendingSummaryForUser()
      setCloudStatus('unauthenticated')
      useSyncHealthStore.getState().markCloudUnauthenticated(emptySummary)
      return
    }

    const pendingSummary = await readPendingSummaryForUser(
      accessState.dataOwnerUserId
    )
    const syncHealth = useSyncHealthStore.getState()
    syncHealth.setPendingSummary(pendingSummary)

    const localSignature = computeCloudSignature(getState())
    const remoteSnapshot = await loadFromSupabase(accessState.dataOwnerUserId)
    const remoteSignature = computeCloudSnapshotSignature(remoteSnapshot)
    const remoteHasData = hasCloudSnapshotData(remoteSnapshot)

    if (
      shouldApplyRemoteRefresh({
        pendingOperations: pendingSummary.operations,
        localSignature,
        lastSyncedSignature: lastSyncedCloudSignature,
        remoteSignature,
        remoteHasData,
      })
    ) {
      watchedCloudSignature = remoteSignature
      lastSyncedCloudSignature = remoteSignature
      applyCloudSnapshot(remoteSnapshot)
      setCloudStatus('synced')
      syncHealth.markCloudSuccess(pendingSummary)
      return
    }

    if (
      pendingSummary.operations === 0 &&
      remoteHasData &&
      localSignature === remoteSignature
    ) {
      recordCloudSignature(remoteSignature)
    }
  } catch (error) {
    console.warn(
      '[Cloud Sync] No se pudo refrescar el snapshot remoto:',
      describeCloudSyncError(error)
    )
  }
}

export function ensureCloudSyncWatcher(
  subscribe: (listener: (state: AppStoreCloudCapabilities) => void) => () => void,
  getState: () => AppStoreCloudCapabilities,
  triggerCloudSync: () => Promise<void>,
  setCloudStatus: (status: CloudSyncStatus) => void,
  applyCloudSnapshot: ApplyCloudSnapshot
): void {
  if (typeof window === 'undefined' || hasCloudSyncWatcher) {
    return
  }

  watchedCloudSignature ??= computeCloudSignature(getState())
  let syncTimer: number | undefined
  let remoteRefreshTimer: number | undefined

  const refreshPendingSummary = async (): Promise<void> => {
    try {
      const accessState = getSharedAccessState()
      const summary = await readPendingSummaryForUser(
        accessState.dataOwnerUserId ?? undefined
      )
      const syncHealth = useSyncHealthStore.getState()

      syncHealth.setPendingSummary(summary)

      if (!hasReadyCloudAccess(accessState)) {
        setCloudStatus('unauthenticated')
        syncHealth.markCloudUnauthenticated(summary)
        return
      }

      if (!window.navigator.onLine) {
        setCloudStatus('offline')
        syncHealth.markCloudFailure('offline', null, summary)
      }
    } catch (error) {
      console.warn(
        '[Cloud Sync] No se pudo refrescar la cola pendiente:',
        describeCloudSyncError(error)
      )
    }
  }

  const refreshRemoteSnapshot = async (): Promise<void> => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return
    }

    await refreshCloudSnapshotIfNeeded(getState, applyCloudSnapshot, setCloudStatus)
  }

  const runOnlineRecovery = async (): Promise<void> => {
    await refreshRemoteSnapshot()
    await triggerCloudSync()
  }

  subscribe(state => {
    if (state.isLoading) return

    const nextSignature = computeCloudSignature(state)
    if (nextSignature === watchedCloudSignature) return

    watchedCloudSignature = nextSignature
    window.clearTimeout(syncTimer)
    syncTimer = window.setTimeout(() => {
      void triggerCloudSync()
    }, 500)
  })

  window.addEventListener('online', () => {
    void runOnlineRecovery()
  })

  window.addEventListener('offline', () => {
    void refreshPendingSummary()
  })

  window.addEventListener('focus', () => {
    void refreshRemoteSnapshot()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void refreshRemoteSnapshot()
    }
  })

  remoteRefreshTimer = window.setInterval(() => {
    void refreshRemoteSnapshot()
  }, REMOTE_REFRESH_INTERVAL_MS)

  hasCloudSyncWatcher = true

  if (window.navigator.onLine) {
    void runOnlineRecovery()
  } else {
    void refreshPendingSummary()
  }
}

export { extractWeeklyPlansFromHistoryEvents }
