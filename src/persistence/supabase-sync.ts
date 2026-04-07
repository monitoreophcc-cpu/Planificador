import { createClient } from '@/lib/supabase/client'
import {
  createEmptySnapshot,
  deserializeCloudSnapshot,
  extractWeeklyPlansFromHistoryEvents,
  serializeCoverageRules,
  serializeIncidents,
  serializeRepresentatives,
  serializeSwaps,
  serializeWeeklyPlans,
} from './supabase-sync-data'
import {
  enqueuePending,
  flushPendingQueue,
  isBrowserOffline,
  syncRowsSnapshot,
  toErrorMessage,
} from './supabase-sync-runtime'
import type {
  CloudSnapshot,
  SyncResult,
  SyncRow,
  SyncTable,
  SyncableStoreState,
} from './supabase-sync-types'

export type { CloudSnapshot, SyncResult } from './supabase-sync-types'
export { extractWeeklyPlansFromHistoryEvents } from './supabase-sync-data'

export async function loadFromSupabase(userId: string): Promise<CloudSnapshot> {
  if (isBrowserOffline()) {
    return createEmptySnapshot()
  }

  const supabase = createClient()

  const [
    representativesRes,
    weeklyPlansRes,
    incidentsRes,
    swapsRes,
    coverageRulesRes,
  ] = await Promise.all([
    supabase
      .from('representatives')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true }),
    supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: true }),
    supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true }),
    supabase
      .from('swaps')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true }),
    supabase
      .from('coverage_rules')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: true }),
  ])

  const firstError =
    representativesRes.error ??
    weeklyPlansRes.error ??
    incidentsRes.error ??
    swapsRes.error ??
    coverageRulesRes.error

  if (firstError) {
    throw firstError
  }

  return deserializeCloudSnapshot({
    representativesRows: (representativesRes.data ?? []) as Array<Record<string, unknown>>,
    weeklyPlansRows: (weeklyPlansRes.data ?? []) as Array<Record<string, unknown>>,
    incidentsRows: (incidentsRes.data ?? []) as Array<Record<string, unknown>>,
    swapsRows: (swapsRes.data ?? []) as Array<Record<string, unknown>>,
    coverageRulesRows: (coverageRulesRes.data ?? []) as Array<Record<string, unknown>>,
  })
}

export async function syncAll(
  storeState: SyncableStoreState,
  userId: string
): Promise<SyncResult> {
  const weeklyPlans = extractWeeklyPlansFromHistoryEvents(storeState.historyEvents)

  const snapshots: Array<{ table: SyncTable; rows: SyncRow[] }> = [
    {
      table: 'representatives',
      rows: serializeRepresentatives(storeState.representatives, userId),
    },
    {
      table: 'weekly_plans',
      rows: serializeWeeklyPlans(weeklyPlans, userId),
    },
    {
      table: 'incidents',
      rows: serializeIncidents(storeState.incidents, userId),
    },
    {
      table: 'swaps',
      rows: serializeSwaps(storeState.swaps, userId),
    },
    {
      table: 'coverage_rules',
      rows: serializeCoverageRules(storeState.coverageRules, userId),
    },
  ]

  try {
    if (isBrowserOffline()) {
      await Promise.all(
        snapshots.map(snapshot =>
          enqueuePending(userId, snapshot.table, snapshot.rows)
        )
      )

      return { success: false, error: 'offline_pending_sync' }
    }

    await flushPendingQueue(userId)

    const results = await Promise.all(
      snapshots.map(snapshot =>
        syncRowsSnapshot(userId, snapshot.table, snapshot.rows)
      )
    )

    const failed = results.find(result => !result.success)
    if (failed) {
      return failed
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}
