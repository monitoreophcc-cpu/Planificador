import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createClient } from '@/lib/supabase/client'
import type {
  CoverageRule,
  Incident,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { AppState as AppStoreState } from '@/store/useAppStore'
import { createClient } from '@/lib/supabase/client'

export type SyncResult = { success: boolean; error?: string }

type CloudSnapshot = {
  representatives: Representative[]
  weeklyPlans: WeeklyPlan[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
}

async function logSyncAudit(
  userId: string,
  entity: string,
  payload: unknown,
  error?: string
): Promise<void> {
  const supabase = createClient()
  await supabase.from('audit_log').insert({
    user_id: userId,
    action: 'SYNC',
    entity,
    payload: {
      ok: !error,
      error: error ?? null,
      timestamp: new Date().toISOString(),
      size: Array.isArray(payload) ? payload.length : 1,
    },
  })
}

async function executeUpsert(
  table:
    | 'representatives'
    | 'weekly_plans'
    | 'incidents'
    | 'swaps'
    | 'coverage_rules',
  rows: Record<string, unknown>[],
  userId: string
): Promise<SyncResult> {
  if (rows.length === 0) {
    return { success: true }
  }

  const supabase = createClient()
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })

  if (error) {
    await logSyncAudit(userId, table, rows, error.message)
    return { success: false, error: error.message }
  }

  await logSyncAudit(userId, table, rows)
  return { success: true }

export type SyncResult = { success: boolean; error?: string }

type PendingOperation = {
  id: string
  table: 'representatives' | 'weekly_plans' | 'incidents' | 'swaps' | 'coverage_rules'
  payload: Record<string, unknown> | Array<Record<string, unknown>>
  pending_sync: true
}

interface SyncQueueDb extends DBSchema {
  pending_sync: {
    key: string
    value: PendingOperation
  }
}

const DB_NAME = 'cloud-sync-queue'
const DB_VERSION = 1

export type AppStoreState = {
  representatives: Representative[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
  weeklyPlan?: WeeklyPlan | null
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'sync_error'
}

async function getQueueDb(): Promise<IDBPDatabase<SyncQueueDb> | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return null
  }

  return openDB<SyncQueueDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id' })
      }
    },
  })
}

async function enqueuePending(
  table: PendingOperation['table'],
  payload: PendingOperation['payload']
): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  await db.put('pending_sync', {
    id: `${table}:${crypto.randomUUID()}`,
    table,
    payload,
    pending_sync: true,
  })

  db.close()
}

async function flushPendingQueue(): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  const supabase = createClient()
  const pending = await db.getAll('pending_sync')

  for (const operation of pending) {
    const { error } = await supabase
      .from(operation.table)
      .upsert(operation.payload, { onConflict: 'id' })

    if (!error) {
      await db.delete('pending_sync', operation.id)
    }
  }

  db.close()
}

async function writeAuditLog(userId: string, entity: string, payload: unknown): Promise<void> {
  const supabase = createClient()

  await supabase.from('audit_log').insert({
    user_id: userId,
    action: 'SYNC',
    entity,
    payload,
  })
}

export async function syncRepresentatives(
  representatives: Representative[],
  userId: string
): Promise<SyncResult> {
  try {
    const rows = representatives.map(rep => ({
      id: rep.id,
      user_id: userId,
      name: rep.name,
      base_shift: rep.baseShift,
      base_schedule: rep.baseSchedule,
      mix_profile: rep.mixProfile ?? null,
      role: rep.role,
      updated_at: new Date().toISOString(),
    }))

    return executeUpsert('representatives', rows, userId)
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'syncRepresentatives_failed' }
  }
}

export async function syncWeeklyPlan(
  plan: WeeklyPlan,
  userId: string
): Promise<SyncResult> {
    if (!navigator.onLine) {
      await enqueuePending('representatives', rows)
      return { success: false, error: 'offline_pending_sync' }
    }

    const supabase = createClient()
    const { error } = await supabase.from('representatives').upsert(rows, { onConflict: 'id' })

    if (error) {
      await enqueuePending('representatives', rows)
      return { success: false, error: error.message }
    }

    await writeAuditLog(userId, 'representatives', { count: rows.length })
    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

export async function syncWeeklyPlan(plan: WeeklyPlan, userId: string): Promise<SyncResult> {
  try {
    const row = {
      id: plan.weekStart,
      user_id: userId,
      week_start: plan.weekStart,
      agents: plan.agents,
      updated_at: new Date().toISOString(),
    }

    return executeUpsert('weekly_plans', [row], userId)
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'syncWeeklyPlan_failed' }
    if (!navigator.onLine) {
      await enqueuePending('weekly_plans', row)
      return { success: false, error: 'offline_pending_sync' }
    }

    const supabase = createClient()
    const { error } = await supabase.from('weekly_plans').upsert(row, { onConflict: 'id' })

    if (error) {
      await enqueuePending('weekly_plans', row)
      return { success: false, error: error.message }
    }

    await writeAuditLog(userId, 'weekly_plans', { weekStart: plan.weekStart })
    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

export async function syncIncidents(
  incidents: Incident[],
  userId: string
): Promise<SyncResult> {
  try {
    const rows = incidents.map(incident => ({
      id: incident.id,
      user_id: userId,
      representative_id: incident.representativeId,
      type: incident.type,
      date: incident.startDate,
      end_date: incident.duration > 1 ? incident.startDate : null,
      notes: incident.note ?? null,
      points: incident.customPoints ?? 0,
    }))

    return executeUpsert('incidents', rows, userId)
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'syncIncidents_failed' }
  }
}

export async function syncSwaps(
  swaps: SwapEvent[],
  userId: string
): Promise<SyncResult> {
  try {
    const rows = swaps.map(swap => {
      if (swap.type === 'SWAP') {
        return {
          id: swap.id,
          user_id: userId,
          type: swap.type,
          date: swap.date,
          agent_a: swap.fromRepresentativeId,
          agent_b: swap.toRepresentativeId,
          shift: `${swap.fromShift}->${swap.toShift}`,
        }
      }

      if (swap.type === 'COVER') {
        return {
          id: swap.id,
          user_id: userId,
          type: swap.type,
          date: swap.date,
          agent_a: swap.fromRepresentativeId,
          agent_b: swap.toRepresentativeId,
          shift: swap.shift,
        }
      }

      return {
        id: swap.id,
        user_id: userId,
        type: swap.type,
        date: swap.date,
        agent_a: swap.representativeId,
        agent_b: null,
        shift: swap.shift,
      }
    })

    return executeUpsert('swaps', rows, userId)
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'syncSwaps_failed' }
    const rows = incidents
      .filter(incident =>
        ['AUSENCIA', 'TARDANZA', 'LICENCIA', 'VACACIONES', 'ERROR', 'OTRO'].includes(
          incident.type
        )
      )
      .map(incident => ({
        id: incident.id,
        user_id: userId,
        representative_id: incident.representativeId,
        type: incident.type,
        date: incident.startDate,
        end_date: incident.duration > 1 ? incident.startDate : null,
        notes: incident.note ?? null,
        points: incident.customPoints ?? 0,
      }))

    if (!navigator.onLine) {
      await enqueuePending('incidents', rows)
      return { success: false, error: 'offline_pending_sync' }
    }

    const supabase = createClient()
    const { error } = await supabase.from('incidents').upsert(rows, { onConflict: 'id' })

    if (error) {
      await enqueuePending('incidents', rows)
      return { success: false, error: error.message }
    }

    await writeAuditLog(userId, 'incidents', { count: rows.length })
    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

export async function syncSwaps(swaps: SwapEvent[], userId: string): Promise<SyncResult> {
  try {
    const rows = swaps.map(swap => ({
      id: swap.id,
      user_id: userId,
      type: swap.type,
      date: swap.date,
      shift: 'shift' in swap ? swap.shift : swap.fromShift,
      agent_a: 'representativeId' in swap ? swap.representativeId : swap.fromRepresentativeId,
      agent_b: 'toRepresentativeId' in swap ? swap.toRepresentativeId : null,
    }))

    if (!navigator.onLine) {
      await enqueuePending('swaps', rows)
      return { success: false, error: 'offline_pending_sync' }
    }

    const supabase = createClient()
    const { error } = await supabase.from('swaps').upsert(rows, { onConflict: 'id' })

    if (error) {
      await enqueuePending('swaps', rows)
      return { success: false, error: error.message }
    }

    await writeAuditLog(userId, 'swaps', { count: rows.length })
    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

export async function syncCoverageRules(
  rules: CoverageRule[],
  userId: string
): Promise<SyncResult> {
  try {
    const rows = rules.map(rule => {
      const scopeType = rule.scope.type
      return {
        id: rule.id,
        user_id: userId,
        scope: scopeType,
        shift: scopeType === 'SHIFT' ? rule.scope.shift : null,
        date: scopeType === 'DATE' ? rule.scope.date : null,
        required: rule.required,
      }
    })

    return executeUpsert('coverage_rules', rows, userId)
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'syncCoverageRules_failed' }
  }
}

export async function loadFromSupabase(userId: string): Promise<CloudSnapshot> {
  const supabase = createClient()

  const [representativesRes, weeklyPlansRes, incidentsRes, swapsRes, coverageRes] =
    const rows = rules.map(rule => ({
      id: rule.id,
      user_id: userId,
      scope: rule.scope.type,
      shift: rule.scope.type === 'SHIFT' ? rule.scope.shift : null,
      date: rule.scope.type === 'DATE' ? rule.scope.date : null,
      required: rule.required,
    }))

    if (!navigator.onLine) {
      await enqueuePending('coverage_rules', rows)
      return { success: false, error: 'offline_pending_sync' }
    }

    const supabase = createClient()
    const { error } = await supabase.from('coverage_rules').upsert(rows, { onConflict: 'id' })

    if (error) {
      await enqueuePending('coverage_rules', rows)
      return { success: false, error: error.message }
    }

    await writeAuditLog(userId, 'coverage_rules', { count: rows.length })
    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

export async function loadFromSupabase(userId: string): Promise<{
  representatives: Representative[]
  weeklyPlans: WeeklyPlan[]
  incidents: Incident[]
  swaps: SwapEvent[]
  coverageRules: CoverageRule[]
}> {
  const supabase = createClient()

  const [representativesRes, weeklyPlansRes, incidentsRes, swapsRes, coverageRulesRes] =
    await Promise.all([
      supabase.from('representatives').select('*').eq('user_id', userId),
      supabase.from('weekly_plans').select('*').eq('user_id', userId),
      supabase.from('incidents').select('*').eq('user_id', userId),
      supabase.from('swaps').select('*').eq('user_id', userId),
      supabase.from('coverage_rules').select('*').eq('user_id', userId),
    ])

  return {
    representatives: (representativesRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.name),
      baseShift: row.base_shift === 'NIGHT' ? 'NIGHT' : 'DAY',
      baseSchedule: (row.base_schedule ?? {}) as Representative['baseSchedule'],
      mixProfile: (row.mix_profile ?? undefined) as Representative['mixProfile'],
      role: (row.role ?? 'SALES') as Representative['role'],
      isActive: true,
      orderIndex: 0,
    })),
    weeklyPlans: (weeklyPlansRes.data ?? []).map((row: Record<string, unknown>) => ({
      weekStart: String(row.week_start),
      agents: (row.agents ?? []) as WeeklyPlan['agents'],
    })),
    incidents: (incidentsRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      representativeId: String(row.representative_id),
      type: row.type as Incident['type'],
      startDate: String(row.date),
      duration: 1,
      note: row.notes ?? undefined,
      createdAt: String(row.created_at ?? new Date().toISOString()),
      customPoints: typeof row.points === 'number' ? row.points : undefined,
    })),
    swaps: (swapsRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      type: row.type,
      date: String(row.date),
      representativeId: String(row.agent_a),
      shift: row.shift === 'NIGHT' ? 'NIGHT' : 'DAY',
      createdAt: String(row.created_at ?? new Date().toISOString()),
    })) as SwapEvent[],
    coverageRules: (coverageRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      scope:
        row.scope === 'DATE'
          ? { type: 'DATE', date: String(row.date) }
          : row.scope === 'SHIFT'
            ? { type: 'SHIFT', shift: row.shift === 'NIGHT' ? 'NIGHT' : 'DAY' }
            : { type: 'GLOBAL' },
      required: Number(row.required ?? 0),
  const representatives = (representativesRes.data ?? []) as Array<Record<string, any>>
  const weeklyPlans = (weeklyPlansRes.data ?? []) as Array<Record<string, any>>
  const incidents = (incidentsRes.data ?? []) as Array<Record<string, any>>
  const swaps = (swapsRes.data ?? []) as Array<Record<string, any>>
  const coverageRules = (coverageRulesRes.data ?? []) as Array<Record<string, any>>

  return {
    representatives: representatives.map(rep => ({
      id: rep.id,
      name: rep.name,
      baseShift: rep.base_shift,
      baseSchedule: rep.base_schedule,
      mixProfile: rep.mix_profile ?? undefined,
      role: rep.role,
      isActive: true,
      orderIndex: 0,
    })),
    weeklyPlans: weeklyPlans.map(plan => ({
      weekStart: plan.week_start,
      agents: plan.agents,
    })),
    incidents: incidents.map(incident => ({
      id: incident.id,
      representativeId: incident.representative_id,
      type: incident.type,
      startDate: incident.date,
      duration: incident.end_date ? 2 : 1,
      note: incident.notes ?? undefined,
      createdAt: incident.created_at,
      customPoints: incident.points ?? undefined,
    })),
    swaps: swaps.map(swap => ({
      id: swap.id,
      type: swap.type,
      date: swap.date,
      shift: swap.shift,
      fromRepresentativeId: swap.agent_a,
      toRepresentativeId: swap.agent_b ?? swap.agent_a,
      createdAt: swap.created_at,
    })) as SwapEvent[],
    coverageRules: coverageRules.map(rule => ({
      id: rule.id,
      scope:
        rule.scope === 'SHIFT'
          ? { type: 'SHIFT', shift: rule.shift }
          : rule.scope === 'DATE'
            ? { type: 'DATE', date: rule.date }
            : { type: 'GLOBAL' },
      required: rule.required,
    })),
  }
}

export async function syncAll(
  storeState: AppStoreState,
  userId: string
): Promise<SyncResult> {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return { success: false, error: 'offline' }
  }

  const repsResult = await syncRepresentatives(storeState.representatives, userId)
  const incidentsResult = await syncIncidents(storeState.incidents, userId)
  const swapsResult = await syncSwaps(storeState.swaps, userId)
  const coverageResult = await syncCoverageRules(storeState.coverageRules, userId)

  const firstError =
    repsResult.error ?? incidentsResult.error ?? swapsResult.error ?? coverageResult.error

  if (firstError) {
    return { success: false, error: firstError }
  }

  return { success: true }
  try {
    await flushPendingQueue()

    const results = await Promise.all([
      syncRepresentatives(storeState.representatives, userId),
      syncIncidents(storeState.incidents, userId),
      syncSwaps(storeState.swaps, userId),
      syncCoverageRules(storeState.coverageRules, userId),
      storeState.weeklyPlan ? syncWeeklyPlan(storeState.weeklyPlan, userId) : Promise.resolve({ success: true }),
    ])

    const failed = results.find(result => !result.success)
    if (failed) {
      return failed
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: toErrorMessage(error) }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushPendingQueue()
  })
}
