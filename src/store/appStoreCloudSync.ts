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
import type { CloudSyncStatus } from './useCloudSyncStore'

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

export async function runCloudSync(
  getState: () => AppStoreCloudCapabilities,
  setCloudStatus: (status: CloudSyncStatus) => void
): Promise<void> {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    setCloudStatus('offline')
    return
  }

  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user.id) {
      setCloudStatus('synced')
      return
    }

    setCloudStatus('syncing')

    const result = await syncAll(getState(), session.user.id)

    if (result.success) {
      setCloudStatus('synced')
    } else if (result.error === 'offline_pending_sync') {
      setCloudStatus('offline')
    } else {
      setCloudStatus('error')
    }
  } catch (error) {
    console.error('[Cloud Sync] No se pudo sincronizar con Supabase.', error)
    setCloudStatus('error')
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

  hasCloudSyncWatcher = true

  if (window.navigator.onLine) {
    void triggerCloudSync()
  } else {
    setCloudStatus('offline')
  }
}

export { extractWeeklyPlansFromHistoryEvents }
