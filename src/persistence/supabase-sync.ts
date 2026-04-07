import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  CoverageRule,
  Incident,
  PlanningBaseState,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { HistoryEvent } from '@/domain/history/types'
import { createClient } from '@/lib/supabase/client'

export type SyncResult = {
  success: boolean
  error?: string
}

export type CloudSnapshot = {
  representatives: Representative[]
  weeklyPlans: WeeklyPlan[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
}

type SyncTable =
  | 'representatives'
  | 'weekly_plans'
  | 'incidents'
  | 'swaps'
  | 'coverage_rules'

type SyncableStoreState = Pick<
  PlanningBaseState,
  'representatives' | 'incidents' | 'swaps' | 'coverageRules' | 'historyEvents'
>

type SyncRow = Record<string, unknown>

type PendingOperation = {
  key: string
  userId: string
  table: SyncTable
  rows: SyncRow[]
}

interface SyncQueueDb extends DBSchema {
  pending_sync: {
    key: string
    value: PendingOperation
  }
}

const DB_NAME = 'cloud-sync-queue'
const DB_VERSION = 2

function createEmptySnapshot(): CloudSnapshot {
  return {
    representatives: [],
    weeklyPlans: [],
    incidents: [],
    swaps: [],
    coverageRules: [],
  }
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unexpected_sync_error'
}

function queueKey(userId: string, table: SyncTable): string {
  return `${userId}:${table}`
}

async function getQueueDb(): Promise<IDBPDatabase<SyncQueueDb> | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return null
  }

  return openDB<SyncQueueDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains('pending_sync')) {
        db.deleteObjectStore('pending_sync')
      }

      db.createObjectStore('pending_sync', { keyPath: 'key' })
    },
  })
}

async function enqueuePending(
  userId: string,
  table: SyncTable,
  rows: SyncRow[]
): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  await db.put('pending_sync', {
    key: queueKey(userId, table),
    userId,
    table,
    rows,
  })

  db.close()
}

async function clearPending(userId: string, table: SyncTable): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  await db.delete('pending_sync', queueKey(userId, table))
  db.close()
}

async function logSyncAudit(
  userId: string,
  entity: string,
  payload: unknown,
  error?: string
): Promise<void> {
  try {
    const supabase = createClient()

    await supabase.from('audit_log').insert({
      user_id: userId,
      action: error ? 'SYNC_ERROR' : 'SYNC',
      entity,
      payload: {
        ok: !error,
        error: error ?? null,
        timestamp: new Date().toISOString(),
        ...(
          typeof payload === 'object' && payload !== null
            ? (payload as Record<string, unknown>)
            : { value: payload }
        ),
      },
    })
  } catch (auditError) {
    console.error('[Supabase Sync] No se pudo registrar audit_log.', auditError)
  }
}

function isWeeklyPlanHistoryEvent(
  event: HistoryEvent
): event is HistoryEvent & { metadata: { weeklyPlan: WeeklyPlan } } {
  if (event.category !== 'PLANNING' || !event.metadata) {
    return false
  }

  const weeklyPlan = (event.metadata as Record<string, unknown>).weeklyPlan

  return (
    typeof weeklyPlan === 'object' &&
    weeklyPlan !== null &&
    typeof (weeklyPlan as WeeklyPlan).weekStart === 'string' &&
    Array.isArray((weeklyPlan as WeeklyPlan).agents)
  )
}

export function extractWeeklyPlansFromHistoryEvents(
  historyEvents: HistoryEvent[]
): WeeklyPlan[] {
  const byWeekStart = new Map<string, WeeklyPlan>()

  historyEvents
    .filter(isWeeklyPlanHistoryEvent)
    .forEach(event => {
      byWeekStart.set(event.metadata.weeklyPlan.weekStart, event.metadata.weeklyPlan)
    })

  return [...byWeekStart.values()].sort((left, right) =>
    left.weekStart.localeCompare(right.weekStart)
  )
}

function normalizeShift(value: unknown): 'DAY' | 'NIGHT' {
  return value === 'NIGHT' ? 'NIGHT' : 'DAY'
}

function normalizeRepresentativeRole(value: unknown): Representative['role'] {
  if (
    value === 'CUSTOMER_SERVICE' ||
    value === 'SUPERVISOR' ||
    value === 'MANAGER'
  ) {
    return value
  }

  return 'SALES'
}

function serializeRepresentatives(
  representatives: Representative[],
  userId: string
): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return representatives.map(representative => ({
    id: representative.id,
    user_id: userId,
    name: representative.name,
    base_shift: representative.baseShift,
    base_schedule: representative.baseSchedule,
    mix_profile: representative.mixProfile ?? null,
    role: representative.role,
    is_active: representative.isActive,
    order_index: representative.orderIndex,
    updated_at: updatedAt,
  }))
}

function serializeWeeklyPlans(
  weeklyPlans: WeeklyPlan[],
  userId: string
): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return weeklyPlans.map(plan => ({
    id: plan.weekStart,
    user_id: userId,
    week_start: plan.weekStart,
    agents: plan.agents,
    updated_at: updatedAt,
  }))
}

function serializeIncidents(incidents: Incident[], userId: string): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return incidents.map(incident => ({
    id: incident.id,
    user_id: userId,
    representative_id: incident.representativeId,
    type: incident.type,
    start_date: incident.startDate,
    duration: incident.duration,
    note: incident.note ?? null,
    created_at: incident.createdAt,
    custom_points: incident.customPoints ?? null,
    assignment: incident.assignment ?? null,
    previous_assignment: incident.previousAssignment ?? null,
    details: incident.details ?? null,
    source: incident.source ?? null,
    slot_owner_id: incident.slotOwnerId ?? null,
    metadata: incident.metadata ?? null,
    disciplinary_key: incident.disciplinaryKey ?? null,
    updated_at: updatedAt,
  }))
}

function serializeSwaps(swaps: SwapEvent[], userId: string): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return swaps.map(swap => {
    if (swap.type === 'SWAP') {
      return {
        id: swap.id,
        user_id: userId,
        type: swap.type,
        date: swap.date,
        shift: null,
        from_representative_id: swap.fromRepresentativeId,
        to_representative_id: swap.toRepresentativeId,
        representative_id: null,
        from_shift: swap.fromShift,
        to_shift: swap.toShift,
        note: swap.note ?? null,
        created_at: swap.createdAt,
        updated_at: updatedAt,
      }
    }

    if (swap.type === 'COVER') {
      return {
        id: swap.id,
        user_id: userId,
        type: swap.type,
        date: swap.date,
        shift: swap.shift,
        from_representative_id: swap.fromRepresentativeId,
        to_representative_id: swap.toRepresentativeId,
        representative_id: null,
        from_shift: null,
        to_shift: null,
        note: swap.note ?? null,
        created_at: swap.createdAt,
        updated_at: updatedAt,
      }
    }

    return {
      id: swap.id,
      user_id: userId,
      type: swap.type,
      date: swap.date,
      shift: swap.shift,
      from_representative_id: null,
      to_representative_id: null,
      representative_id: swap.representativeId,
      from_shift: null,
      to_shift: null,
      note: swap.note ?? null,
      created_at: swap.createdAt,
      updated_at: updatedAt,
    }
  })
}

function serializeCoverageRules(
  coverageRules: CoverageRule[],
  userId: string
): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return coverageRules.map(rule => ({
    id: rule.id,
    user_id: userId,
    scope: rule.scope,
    required: rule.required,
    label: rule.label ?? null,
    updated_at: updatedAt,
  }))
}

async function syncRowsSnapshot(
  userId: string,
  table: SyncTable,
  rows: SyncRow[],
  queueOnFailure = true
): Promise<SyncResult> {
  if (isBrowserOffline()) {
    if (queueOnFailure) {
      await enqueuePending(userId, table, rows)
    }

    return { success: false, error: 'offline_pending_sync' }
  }

  const supabase = createClient()
  const localIds = new Set(rows.map(row => String(row.id)))

  const { data: remoteIds, error: listError } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)

  if (listError) {
    if (queueOnFailure) {
      await enqueuePending(userId, table, rows)
    }

    await logSyncAudit(userId, table, { stage: 'list_ids' }, listError.message)
    return { success: false, error: listError.message }
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from(table)
      .upsert(rows, { onConflict: 'user_id,id' })

    if (upsertError) {
      if (queueOnFailure) {
        await enqueuePending(userId, table, rows)
      }

      await logSyncAudit(userId, table, { stage: 'upsert', rows: rows.length }, upsertError.message)
      return { success: false, error: upsertError.message }
    }
  }

  const idsToDelete = (remoteIds ?? [])
    .map(row => String((row as { id: string }).id))
    .filter(id => !localIds.has(id))

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .in('id', idsToDelete)

    if (deleteError) {
      if (queueOnFailure) {
        await enqueuePending(userId, table, rows)
      }

      await logSyncAudit(
        userId,
        table,
        { stage: 'delete_missing', rows: idsToDelete.length },
        deleteError.message
      )
      return { success: false, error: deleteError.message }
    }
  }

  await clearPending(userId, table)
  await logSyncAudit(userId, table, {
    stage: 'complete',
    upserted: rows.length,
    deleted: idsToDelete.length,
  })

  return { success: true }
}

async function flushPendingQueue(userId: string): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  const pending = await db.getAll('pending_sync')
  db.close()

  const relevant = pending.filter(operation => operation.userId === userId)

  for (const operation of relevant) {
    const result = await syncRowsSnapshot(
      operation.userId,
      operation.table,
      operation.rows,
      false
    )

    if (result.success) {
      await clearPending(operation.userId, operation.table)
    }
  }
}

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

  const representativesRows = (representativesRes.data ?? []) as Array<Record<string, unknown>>
  const weeklyPlansRows = (weeklyPlansRes.data ?? []) as Array<Record<string, unknown>>
  const incidentsRows = (incidentsRes.data ?? []) as Array<Record<string, unknown>>
  const swapsRows = (swapsRes.data ?? []) as Array<Record<string, unknown>>
  const coverageRulesRows = (coverageRulesRes.data ?? []) as Array<Record<string, unknown>>

  return {
    representatives: representativesRows.map((row, index) => ({
      id: String(row.id),
      name: String(row.name),
      baseShift: normalizeShift(row.base_shift),
      baseSchedule: (row.base_schedule ?? {}) as Representative['baseSchedule'],
      mixProfile: (row.mix_profile ?? undefined) as Representative['mixProfile'],
      role: normalizeRepresentativeRole(row.role),
      isActive: typeof row.is_active === 'boolean' ? row.is_active : true,
      orderIndex:
        typeof row.order_index === 'number' ? row.order_index : index,
    })),
    weeklyPlans: weeklyPlansRows.map(row => ({
      weekStart: String(row.week_start),
      agents: (row.agents ?? []) as WeeklyPlan['agents'],
    })),
    incidents: incidentsRows.map(row => ({
      id: String(row.id),
      representativeId: String(row.representative_id),
      type: row.type as Incident['type'],
      startDate: String(row.start_date),
      duration: typeof row.duration === 'number' ? row.duration : 1,
      note: typeof row.note === 'string' ? row.note : undefined,
      createdAt:
        typeof row.created_at === 'string'
          ? row.created_at
          : new Date().toISOString(),
      customPoints:
        typeof row.custom_points === 'number' ? row.custom_points : undefined,
      assignment: (row.assignment ?? undefined) as Incident['assignment'],
      previousAssignment: (row.previous_assignment ?? undefined) as Incident['previousAssignment'],
      details: typeof row.details === 'string' ? row.details : undefined,
      source: (row.source ?? undefined) as Incident['source'],
      slotOwnerId:
        typeof row.slot_owner_id === 'string' ? row.slot_owner_id : undefined,
      metadata: (row.metadata ?? undefined) as Incident['metadata'],
      disciplinaryKey:
        typeof row.disciplinary_key === 'string'
          ? row.disciplinary_key
          : undefined,
    })),
    swaps: swapsRows
      .map(row => {
        const common = {
          id: String(row.id),
          date: String(row.date),
          note: typeof row.note === 'string' ? row.note : undefined,
          createdAt:
            typeof row.created_at === 'string'
              ? row.created_at
              : new Date().toISOString(),
        }

        if (row.type === 'SWAP') {
          return {
            ...common,
            type: 'SWAP' as const,
            fromRepresentativeId: String(row.from_representative_id),
            toRepresentativeId: String(row.to_representative_id),
            fromShift: normalizeShift(row.from_shift),
            toShift: normalizeShift(row.to_shift),
          }
        }

        if (row.type === 'COVER') {
          return {
            ...common,
            type: 'COVER' as const,
            shift: normalizeShift(row.shift),
            fromRepresentativeId: String(row.from_representative_id),
            toRepresentativeId: String(row.to_representative_id),
          }
        }

        return {
          ...common,
          type: 'DOUBLE' as const,
          shift: normalizeShift(row.shift),
          representativeId: String(row.representative_id),
        }
      }),
    coverageRules: coverageRulesRows.map(row => ({
      id: String(row.id),
      scope: (row.scope ??
        { type: 'GLOBAL' }) as CoverageRule['scope'],
      required: typeof row.required === 'number' ? row.required : 0,
      label: typeof row.label === 'string' ? row.label : undefined,
    })),
  }
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
