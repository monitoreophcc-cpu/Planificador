import { createClient } from '@/lib/supabase/client'
import {
  createEmptySnapshot,
  deserializeCloudSnapshot,
  extractWeeklyPlansFromHistoryEvents,
  serializeCommercialGoals,
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

const SNAPSHOT_TABLES = [
  'representatives',
  'commercial_goals',
  'weekly_plans',
  'incidents',
  'swaps',
  'coverage_rules',
] as const
const OPTIONAL_SNAPSHOT_TABLES = ['commercial_goals'] as const

function errorMessageIncludesTable(message: string, table: string): boolean {
  const normalizedMessage = message.toLowerCase()
  const normalizedTable = table.toLowerCase()

  return (
    normalizedMessage.includes(normalizedTable) ||
    normalizedMessage.includes(`public.${normalizedTable}`)
  )
}

function isMissingSnapshotTableError(error: unknown): boolean {
  if (!(error instanceof Error) && typeof error !== 'object') {
    return false
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '')
  const code =
    error instanceof Error
      ? ''
      : String((error as { code?: unknown }).code ?? '')
  const normalizedMessage = message.toLowerCase()

  return (
    code === '42P01' ||
    code === 'PGRST204' ||
    SNAPSHOT_TABLES.some(tableName =>
      normalizedMessage.includes(tableName.toLowerCase())
    )
  )
}

function isMissingOptionalSnapshotTableError(
  table: (typeof OPTIONAL_SNAPSHOT_TABLES)[number],
  error: unknown
): boolean {
  if (!error || !isMissingSnapshotTableError(error)) {
    return false
  }

  if (!(error instanceof Error) && typeof error !== 'object') {
    return false
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '')

  return errorMessageIncludesTable(message, table)
}

export async function loadFromSupabase(
  dataOwnerUserId: string
): Promise<CloudSnapshot> {
  if (isBrowserOffline()) {
    return createEmptySnapshot()
  }

  const supabase = createClient()

  const [
    representativesRes,
    commercialGoalsRes,
    weeklyPlansRes,
    incidentsRes,
    swapsRes,
    coverageRulesRes,
  ] = await Promise.all([
    supabase
      .from('representatives')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('order_index', { ascending: true }),
    supabase
      .from('commercial_goals')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('shift', { ascending: true })
      .order('segment', { ascending: true }),
    supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('week_start', { ascending: true }),
    supabase
      .from('incidents')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('start_date', { ascending: true }),
    supabase
      .from('swaps')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('date', { ascending: true }),
    supabase
      .from('coverage_rules')
      .select('*')
      .eq('user_id', dataOwnerUserId)
      .order('updated_at', { ascending: true }),
  ])

  const firstError =
    representativesRes.error ??
    weeklyPlansRes.error ??
    incidentsRes.error ??
    swapsRes.error ??
    coverageRulesRes.error ??
    (isMissingOptionalSnapshotTableError(
      'commercial_goals',
      commercialGoalsRes.error
    )
      ? null
      : commercialGoalsRes.error)

  if (firstError) {
    if (isMissingSnapshotTableError(firstError)) {
      return createEmptySnapshot()
    }

    throw firstError
  }

  return deserializeCloudSnapshot({
    representativesRows: (representativesRes.data ?? []) as Array<Record<string, unknown>>,
    commercialGoalsRows: isMissingOptionalSnapshotTableError(
      'commercial_goals',
      commercialGoalsRes.error
    )
      ? []
      : ((commercialGoalsRes.data ?? []) as Array<Record<string, unknown>>),
    weeklyPlansRows: (weeklyPlansRes.data ?? []) as Array<Record<string, unknown>>,
    incidentsRows: (incidentsRes.data ?? []) as Array<Record<string, unknown>>,
    swapsRows: (swapsRes.data ?? []) as Array<Record<string, unknown>>,
    coverageRulesRows: (coverageRulesRes.data ?? []) as Array<Record<string, unknown>>,
  })
}

export async function syncAll(
  storeState: SyncableStoreState,
  dataOwnerUserId: string
): Promise<SyncResult> {
  const weeklyPlans = extractWeeklyPlansFromHistoryEvents(storeState.historyEvents)

  const snapshots: Array<{ table: SyncTable; rows: SyncRow[] }> = [
    {
      table: 'representatives',
      rows: serializeRepresentatives(storeState.representatives, dataOwnerUserId),
    },
    {
      table: 'commercial_goals',
      rows: serializeCommercialGoals(storeState.commercialGoals, dataOwnerUserId),
    },
    {
      table: 'weekly_plans',
      rows: serializeWeeklyPlans(weeklyPlans, dataOwnerUserId),
    },
    {
      table: 'incidents',
      rows: serializeIncidents(storeState.incidents, dataOwnerUserId),
    },
    {
      table: 'swaps',
      rows: serializeSwaps(storeState.swaps, dataOwnerUserId),
    },
    {
      table: 'coverage_rules',
      rows: serializeCoverageRules(storeState.coverageRules, dataOwnerUserId),
    },
  ]

  try {
    if (isBrowserOffline()) {
      await Promise.all(
        snapshots.map(snapshot =>
          enqueuePending(dataOwnerUserId, snapshot.table, snapshot.rows)
        )
      )

      return { success: false, error: 'offline_pending_sync' }
    }

    await flushPendingQueue(dataOwnerUserId)

    const results = await Promise.all(
      snapshots.map(snapshot =>
        syncRowsSnapshot(dataOwnerUserId, snapshot.table, snapshot.rows)
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
