'use client'

import type {
  CoverageRule,
  Incident,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { HistoryEvent } from '@/domain/history/types'
import { createClient } from '@/lib/supabase/client'
import {
  extractWeeklyPlansFromHistoryEvents,
  loadFromSupabase,
  syncAll,
} from '@/persistence/supabase-sync'
import type { CloudSnapshot } from '@/persistence/supabase-sync'
import { getPendingQueueSummary } from '@/persistence/supabase-sync-runtime'
import type { CloudSyncStatus } from './useCloudSyncStore'
import { useSyncHealthStore } from './useSyncHealthStore'

type CloudStateSlice = {
  representatives: Representative[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
  historyEvents: HistoryEvent[]
}

export type AppStoreCloudCapabilities = CloudStateSlice & {
  isLoading: boolean
  triggerCloudSync: () => Promise<void>
}

let hasCloudSyncWatcher = false
let activeCloudSync: Promise<void> | null = null
let shouldRerunCloudSync = false

async function readPendingSummaryForUser(userId?: string) {
  return getPendingQueueSummary(userId)
}

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

export function computeCloudSignature(state: CloudStateSlice): string {
  return JSON.stringify({
    representatives: state.representatives,
    incidents: state.incidents,
    swaps: state.swaps,
    coverageRules: state.coverageRules,
    weeklyPlans: extractWeeklyPlansFromHistoryEvents(state.historyEvents),
  })
}

function hasLocalCloudData(state: CloudStateSlice): boolean {
  return (
    state.representatives.length > 0 ||
    state.incidents.length > 0 ||
    state.swaps.length > 0 ||
    extractWeeklyPlansFromHistoryEvents(state.historyEvents).length > 0
  )
}

async function executeCloudSync(
  getState: () => AppStoreCloudCapabilities,
  setCloudStatus: (status: CloudSyncStatus) => void
): Promise<void> {
  const syncHealth = useSyncHealthStore.getState()

  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user.id ?? undefined
    const initialPendingSummary = await readPendingSummaryForUser(userId)

    syncHealth.setPendingSummary(initialPendingSummary)

    if (!userId) {
      setCloudStatus('unauthenticated')
      syncHealth.markCloudUnauthenticated(initialPendingSummary)
      return
    }

    setCloudStatus('syncing')
    syncHealth.markCloudAttempt()

    const result = await syncAll(getState(), userId)
    const pendingSummary = await readPendingSummaryForUser(userId)

    if (result.success) {
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
    console.error('[Cloud Sync] No se pudo sincronizar con Supabase.', error)
    setCloudStatus('error')
    syncHealth.markCloudFailure(
      'error',
      error instanceof Error ? error.message : 'unexpected_sync_error',
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
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user.id || hasLocalCloudData(state)) {
    return null
  }

  return loadFromSupabase(session.user.id)
}

export function ensureCloudSyncWatcher(
  subscribe: (listener: (state: AppStoreCloudCapabilities) => void) => () => void,
  getState: () => AppStoreCloudCapabilities,
  triggerCloudSync: () => Promise<void>,
  setCloudStatus: (status: CloudSyncStatus) => void
): void {
  if (typeof window === 'undefined' || hasCloudSyncWatcher) {
    return
  }

  let lastSignature = computeCloudSignature(getState())
  let syncTimer: number | undefined

  const refreshPendingSummary = async (): Promise<void> => {
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const summary = await readPendingSummaryForUser(session?.user.id)
      const syncHealth = useSyncHealthStore.getState()

      syncHealth.setPendingSummary(summary)

      if (!session?.user.id) {
        setCloudStatus('unauthenticated')
        syncHealth.markCloudUnauthenticated(summary)
        return
      }

      if (!window.navigator.onLine) {
        setCloudStatus('offline')
        syncHealth.markCloudFailure('offline', null, summary)
      }
    } catch (error) {
      console.error('[Cloud Sync] No se pudo refrescar la cola pendiente.', error)
    }
  }

  subscribe(state => {
    if (state.isLoading) return

    const nextSignature = computeCloudSignature(state)
    if (nextSignature === lastSignature) return

    lastSignature = nextSignature
    window.clearTimeout(syncTimer)
    syncTimer = window.setTimeout(() => {
      void triggerCloudSync()
    }, 500)
  })

  window.addEventListener('online', () => {
    void triggerCloudSync()
  })

  window.addEventListener('offline', () => {
    void refreshPendingSummary()
  })

  hasCloudSyncWatcher = true

  if (window.navigator.onLine) {
    void triggerCloudSync()
  } else {
    void refreshPendingSummary()
  }
}

export { extractWeeklyPlansFromHistoryEvents }
