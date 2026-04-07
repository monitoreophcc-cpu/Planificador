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
}
