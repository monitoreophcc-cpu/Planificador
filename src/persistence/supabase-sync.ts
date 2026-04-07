import { addDays, format, parseISO } from 'date-fns'
import { deriveWeekDays } from '@/domain/calendar/week'
import { buildWeeklySchedule } from '@/domain/planning/buildWeeklySchedule'
import type {
  CoverageRule,
  Incident,
  Representative,
  ShiftAssignment,
  ShiftType,
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

type SyncTable =
  | 'representatives'
  | 'weekly_plans'
  | 'incidents'
  | 'swaps'
  | 'coverage_rules'

type JsonRecord = Record<string, unknown>

type IncidentNotesPayload = {
  note?: string
  duration?: number
  assignment?: ShiftAssignment
  previousAssignment?: ShiftAssignment
  details?: string
  source?: Incident['source']
  slotOwnerId?: string
  metadata?: Record<string, unknown>
  disciplinaryKey?: string
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonRecord(value: unknown): JsonRecord | null {
  if (isRecord(value)) {
    return value
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function isShiftType(value: unknown): value is ShiftType {
  return value === 'DAY' || value === 'NIGHT'
}

function isShiftAssignment(value: unknown): value is ShiftAssignment {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false
  }

  if (value.type === 'NONE' || value.type === 'BOTH') {
    return true
  }

  return value.type === 'SINGLE' && isShiftType(value.shift)
}

function serializeRepresentativeMixProfile(
  representative: Representative
): JsonRecord {
  return {
    profile: representative.mixProfile ?? null,
    isActive: representative.isActive,
    orderIndex: representative.orderIndex,
  }
}

function deserializeRepresentativeMixProfile(
  value: unknown,
  fallbackOrderIndex: number
): Pick<Representative, 'mixProfile' | 'isActive' | 'orderIndex'> {
  const parsed = parseJsonRecord(value)

  if (!parsed) {
    return {
      mixProfile: undefined,
      isActive: true,
      orderIndex: fallbackOrderIndex,
    }
  }

  if ('profile' in parsed) {
    const profileValue = parsed.profile
    const mixProfile =
      isRecord(profileValue) && typeof profileValue.type === 'string'
        ? (profileValue as Representative['mixProfile'])
        : undefined

    return {
      mixProfile,
      isActive:
        typeof parsed.isActive === 'boolean' ? parsed.isActive : true,
      orderIndex:
        typeof parsed.orderIndex === 'number'
          ? parsed.orderIndex
          : fallbackOrderIndex,
    }
  }

  return {
    mixProfile:
      typeof parsed.type === 'string'
        ? (parsed as Representative['mixProfile'])
        : undefined,
    isActive: true,
    orderIndex: fallbackOrderIndex,
  }
}

function serializeIncidentNotes(incident: Incident): string {
  const payload: IncidentNotesPayload = {
    note: incident.note,
    duration: incident.duration,
    assignment: incident.assignment,
    previousAssignment: incident.previousAssignment,
    details: incident.details,
    source: incident.source,
    slotOwnerId: incident.slotOwnerId,
    metadata: incident.metadata as Record<string, unknown> | undefined,
    disciplinaryKey: incident.disciplinaryKey,
  }

  return JSON.stringify(payload)
}

function deserializeIncidentNotes(value: unknown): IncidentNotesPayload {
  const parsed = parseJsonRecord(value)

  if (!parsed) {
    return typeof value === 'string' && value.trim() !== ''
      ? { note: value }
      : {}
  }

  return {
    note: typeof parsed.note === 'string' ? parsed.note : undefined,
    duration:
      typeof parsed.duration === 'number' && parsed.duration > 0
        ? parsed.duration
        : undefined,
    assignment: isShiftAssignment(parsed.assignment)
      ? parsed.assignment
      : undefined,
    previousAssignment: isShiftAssignment(parsed.previousAssignment)
      ? parsed.previousAssignment
      : undefined,
    details: typeof parsed.details === 'string' ? parsed.details : undefined,
    source:
      parsed.source === 'BASE' ||
      parsed.source === 'COVERAGE' ||
      parsed.source === 'SWAP' ||
      parsed.source === 'OVERRIDE'
        ? parsed.source
        : undefined,
    slotOwnerId:
      typeof parsed.slotOwnerId === 'string' ? parsed.slotOwnerId : undefined,
    metadata: isRecord(parsed.metadata)
      ? (parsed.metadata as Record<string, unknown>)
      : undefined,
    disciplinaryKey:
      typeof parsed.disciplinaryKey === 'string'
        ? parsed.disciplinaryKey
        : undefined,
  }
}

function deriveIncidentEndDate(incident: Incident): string | null {
  if (incident.duration <= 1) {
    return null
  }

  return format(
    addDays(parseISO(incident.startDate), incident.duration - 1),
    'yyyy-MM-dd'
  )
}

function deriveIncidentDuration(
  startDate: string,
  endDate: unknown,
  notes: IncidentNotesPayload
): number {
  if (typeof notes.duration === 'number' && notes.duration > 0) {
    return notes.duration
  }

  if (typeof endDate !== 'string' || endDate.trim() === '') {
    return 1
  }

  try {
    return Math.max(
      1,
      Math.round(
        (parseISO(endDate).getTime() - parseISO(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    )
  } catch {
    return 1
  }
}

function serializeSwapShift(swap: SwapEvent): string {
  if (swap.type === 'SWAP') {
    return JSON.stringify({
      type: swap.type,
      fromShift: swap.fromShift,
      toShift: swap.toShift,
      note: swap.note ?? null,
    })
  }

  return JSON.stringify({
    type: swap.type,
    shift: swap.shift,
    note: swap.note ?? null,
  })
}

function deserializeSwapEvent(row: JsonRecord): SwapEvent | null {
  const type = row.type
  const date = typeof row.date === 'string' ? row.date : null
  const createdAt =
    typeof row.created_at === 'string'
      ? row.created_at
      : new Date().toISOString()
  const agentA = typeof row.agent_a === 'string' ? row.agent_a : null
  const agentB = typeof row.agent_b === 'string' ? row.agent_b : null
  const shiftPayload = parseJsonRecord(row.shift)
  const note =
    shiftPayload && typeof shiftPayload.note === 'string'
      ? shiftPayload.note
      : undefined

  if (typeof type !== 'string' || !date || !agentA) {
    return null
  }

  if (type === 'SWAP') {
    const fromShift =
      shiftPayload && isShiftType(shiftPayload.fromShift)
        ? shiftPayload.fromShift
        : typeof row.shift === 'string' && row.shift.includes('->')
          ? row.shift.split('->')[0]
          : null
    const toShift =
      shiftPayload && isShiftType(shiftPayload.toShift)
        ? shiftPayload.toShift
        : typeof row.shift === 'string' && row.shift.includes('->')
          ? row.shift.split('->')[1]
          : null

    if (!agentB || !isShiftType(fromShift) || !isShiftType(toShift)) {
      return null
    }

    return {
      id: String(row.id),
      type: 'SWAP',
      date,
      fromRepresentativeId: agentA,
      fromShift,
      toRepresentativeId: agentB,
      toShift,
      note,
      createdAt,
    }
  }

  if (type === 'COVER') {
    const shift =
      shiftPayload && isShiftType(shiftPayload.shift)
        ? shiftPayload.shift
        : row.shift

    if (!agentB || !isShiftType(shift)) {
      return null
    }

    return {
      id: String(row.id),
      type: 'COVER',
      date,
      shift,
      fromRepresentativeId: agentA,
      toRepresentativeId: agentB,
      note,
      createdAt,
    }
  }

  if (type === 'DOUBLE') {
    const shift =
      shiftPayload && isShiftType(shiftPayload.shift)
        ? shiftPayload.shift
        : row.shift

    if (!isShiftType(shift)) {
      return null
    }

    return {
      id: String(row.id),
      type: 'DOUBLE',
      date,
      shift,
      representativeId: agentA,
      note,
      createdAt,
    }
  }

  return null
}

function serializeCoverageScope(rule: CoverageRule): string {
  return JSON.stringify({
    scope: rule.scope,
    label: rule.label ?? null,
  })
}

function deserializeCoverageRule(row: JsonRecord): CoverageRule {
  const parsed = parseJsonRecord(row.scope)
  const payload = parsed && 'scope' in parsed ? parsed.scope : parsed
  const label =
    parsed && typeof parsed.label === 'string' ? parsed.label : undefined

  if (isRecord(payload) && typeof payload.type === 'string') {
    if (payload.type === 'DATE' && typeof payload.date === 'string') {
      return {
        id: String(row.id),
        scope: { type: 'DATE', date: payload.date },
        required: Number(row.required ?? 0),
        label,
      }
    }

    if (payload.type === 'SHIFT' && isShiftType(payload.shift)) {
      return {
        id: String(row.id),
        scope: { type: 'SHIFT', shift: payload.shift },
        required: Number(row.required ?? 0),
        label,
      }
    }

    if (
      payload.type === 'WEEKDAY' &&
      typeof payload.day === 'number' &&
      payload.day >= 0 &&
      payload.day <= 6
    ) {
      return {
        id: String(row.id),
        scope: {
          type: 'WEEKDAY',
          day: payload.day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          shift: isShiftType(payload.shift) ? payload.shift : undefined,
        },
        required: Number(row.required ?? 0),
        label,
      }
    }

    if (payload.type === 'GLOBAL') {
      return {
        id: String(row.id),
        scope: { type: 'GLOBAL' },
        required: Number(row.required ?? 0),
        label,
      }
    }
  }

  if (row.scope === 'DATE' && typeof row.date === 'string') {
    return {
      id: String(row.id),
      scope: { type: 'DATE', date: row.date },
      required: Number(row.required ?? 0),
      label,
    }
  }

  if (row.scope === 'SHIFT' && isShiftType(row.shift)) {
    return {
      id: String(row.id),
      scope: { type: 'SHIFT', shift: row.shift },
      required: Number(row.required ?? 0),
      label,
    }
  }

  return {
    id: String(row.id),
    scope: { type: 'GLOBAL' },
    required: Number(row.required ?? 0),
    label,
  }
}

function isWeeklyPlan(value: unknown): value is WeeklyPlan {
  return (
    isRecord(value) &&
    typeof value.weekStart === 'string' &&
    Array.isArray(value.agents)
  )
}

function extractHistoryWeeklyPlans(storeState: AppStoreState): WeeklyPlan[] {
  return storeState.historyEvents
    .map(event => event.metadata?.weeklyPlan)
    .filter(isWeeklyPlan)
}

function deriveCurrentWeeklyPlan(storeState: AppStoreState): WeeklyPlan | null {
  if (storeState.representatives.length === 0) {
    return null
  }

  const weekDays = deriveWeekDays(
    storeState.planningAnchorDate,
    storeState.calendar
  )

  if (weekDays.length !== 7) {
    return null
  }

  const allCalendarDays =
    storeState.allCalendarDaysForRelevantMonths.length > 0
      ? storeState.allCalendarDaysForRelevantMonths
      : weekDays

  return buildWeeklySchedule(
    storeState.representatives,
    storeState.incidents,
    storeState.specialSchedules,
    weekDays,
    allCalendarDays
  )
}

function collectWeeklyPlansToSync(storeState: AppStoreState): WeeklyPlan[] {
  const plansByWeek = new Map<string, WeeklyPlan>()

  extractHistoryWeeklyPlans(storeState).forEach(plan => {
    plansByWeek.set(plan.weekStart, plan)
  })

  const currentPlan = deriveCurrentWeeklyPlan(storeState)
  if (currentPlan) {
    plansByWeek.set(currentPlan.weekStart, currentPlan)
  }

  return Array.from(plansByWeek.values())
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
      id: crypto.randomUUID(),
      user_id: userId,
      action: 'SYNC',
      entity,
      entity_id: Array.isArray(payload) ? `${entity}:batch` : entity,
      payload: {
        ok: !error,
        error: error ?? null,
        timestamp: new Date().toISOString(),
        size: Array.isArray(payload) ? payload.length : 1,
      },
      created_at: new Date().toISOString(),
    })
  } catch {
    // Sync audit must never break the offline-first persistence flow.
  }
}

async function executeUpsert(
  table: SyncTable,
  rows: JsonRecord[],
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
    const timestamp = new Date().toISOString()
    const rows = representatives.map(rep => ({
      id: rep.id,
      user_id: userId,
      name: rep.name,
      base_shift: rep.baseShift,
      base_schedule: rep.baseSchedule,
      mix_profile: serializeRepresentativeMixProfile(rep),
      role: rep.role,
      created_at: timestamp,
      updated_at: timestamp,
    }))

    return executeUpsert('representatives', rows, userId)
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'syncRepresentatives_failed',
    }
  }
}

export async function syncWeeklyPlan(
  plan: WeeklyPlan,
  userId: string
): Promise<SyncResult> {
  try {
    const timestamp = new Date().toISOString()
    return executeUpsert(
      'weekly_plans',
      [
        {
          id: plan.weekStart,
          user_id: userId,
          week_start: plan.weekStart,
          agents: plan.agents,
          created_at: timestamp,
          updated_at: timestamp,
        },
      ],
      userId
    )
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'syncWeeklyPlan_failed',
    }
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
      end_date: deriveIncidentEndDate(incident),
      notes: serializeIncidentNotes(incident),
      points: incident.customPoints ?? null,
      created_at: incident.createdAt,
    }))

    return executeUpsert('incidents', rows, userId)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'syncIncidents_failed',
    }
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
          shift: serializeSwapShift(swap),
          created_at: swap.createdAt,
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
          shift: serializeSwapShift(swap),
          created_at: swap.createdAt,
        }
      }

      return {
        id: swap.id,
        user_id: userId,
        type: swap.type,
        date: swap.date,
        agent_a: swap.representativeId,
        agent_b: null,
        shift: serializeSwapShift(swap),
        created_at: swap.createdAt,
      }
    })

    return executeUpsert('swaps', rows, userId)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'syncSwaps_failed',
    }
  }
}

export async function syncCoverageRules(
  rules: CoverageRule[],
  userId: string
): Promise<SyncResult> {
  try {
    const timestamp = new Date().toISOString()
    const rows = rules.map(rule => ({
      id: rule.id,
      user_id: userId,
      scope: serializeCoverageScope(rule),
      shift:
        rule.scope.type === 'SHIFT'
          ? rule.scope.shift
          : rule.scope.type === 'WEEKDAY'
            ? rule.scope.shift ?? null
            : null,
      date: rule.scope.type === 'DATE' ? rule.scope.date : null,
      required: rule.required,
      created_at: timestamp,
    }))

    return executeUpsert('coverage_rules', rows, userId)
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'syncCoverageRules_failed',
    }
  }
}

export async function loadFromSupabase(userId: string): Promise<CloudSnapshot> {
  const supabase = createClient()

  const [
    representativesRes,
    weeklyPlansRes,
    incidentsRes,
    swapsRes,
    coverageRes,
  ] = await Promise.all([
    supabase
      .from('representatives')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: true }),
    supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false }),
    supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('swaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('coverage_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
  ])

  const representativesRows = representativesRes.error
    ? []
    : ((representativesRes.data ?? []) as JsonRecord[])
  const weeklyPlansRows = weeklyPlansRes.error
    ? []
    : ((weeklyPlansRes.data ?? []) as JsonRecord[])
  const incidentsRows = incidentsRes.error
    ? []
    : ((incidentsRes.data ?? []) as JsonRecord[])
  const swapsRows = swapsRes.error
    ? []
    : ((swapsRes.data ?? []) as JsonRecord[])
  const coverageRows = coverageRes.error
    ? []
    : ((coverageRes.data ?? []) as JsonRecord[])

  return {
    representatives: representativesRows.map((row, index) => {
      const mixMetadata = deserializeRepresentativeMixProfile(
        row.mix_profile,
        index
      )

      return {
        id: String(row.id),
        name: String(row.name),
        baseShift: row.base_shift === 'NIGHT' ? 'NIGHT' : 'DAY',
        baseSchedule: isRecord(row.base_schedule)
          ? (row.base_schedule as Representative['baseSchedule'])
          : {},
        mixProfile: mixMetadata.mixProfile,
        role:
          row.role === 'CUSTOMER_SERVICE' ||
          row.role === 'SUPERVISOR' ||
          row.role === 'MANAGER'
            ? row.role
            : 'SALES',
        isActive: mixMetadata.isActive,
        orderIndex: mixMetadata.orderIndex,
      }
    }),
    weeklyPlans: weeklyPlansRows
      .map(row => {
        if (typeof row.week_start !== 'string' || !Array.isArray(row.agents)) {
          return null
        }

        return {
          weekStart: row.week_start,
          agents: row.agents as WeeklyPlan['agents'],
        }
      })
      .filter((plan): plan is WeeklyPlan => Boolean(plan)),
    incidents: incidentsRows
      .map(row => {
        if (
          typeof row.id !== 'string' ||
          typeof row.representative_id !== 'string' ||
          typeof row.type !== 'string' ||
          typeof row.date !== 'string'
        ) {
          return null
        }

        const notes = deserializeIncidentNotes(row.notes)
        const incident: Incident = {
          id: row.id,
          representativeId: row.representative_id,
          type: row.type as Incident['type'],
          startDate: row.date,
          duration: deriveIncidentDuration(row.date, row.end_date, notes),
          note: notes.note,
          createdAt:
            typeof row.created_at === 'string'
              ? row.created_at
              : new Date().toISOString(),
          customPoints:
            typeof row.points === 'number' ? row.points : undefined,
          assignment: notes.assignment,
          previousAssignment: notes.previousAssignment,
          details: notes.details,
          source: notes.source,
          slotOwnerId: notes.slotOwnerId,
          metadata: notes.metadata,
          disciplinaryKey: notes.disciplinaryKey,
        }

        return incident
      })
      .filter((incident): incident is Incident => Boolean(incident)),
    swaps: swapsRows
      .map(deserializeSwapEvent)
      .filter((swap): swap is SwapEvent => Boolean(swap)),
    coverageRules: coverageRows.map(deserializeCoverageRule),
  }
}

export async function syncAll(
  storeState: AppStoreState,
  userId: string
): Promise<SyncResult> {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return { success: false, error: 'offline' }
  }

  const weeklyPlans = collectWeeklyPlansToSync(storeState)
  const repsResult = await syncRepresentatives(storeState.representatives, userId)
  const weeklyPlanResults = await Promise.all(
    weeklyPlans.map(plan => syncWeeklyPlan(plan, userId))
  )
  const incidentsResult = await syncIncidents(storeState.incidents, userId)
  const swapsResult = await syncSwaps(storeState.swaps, userId)
  const coverageResult = await syncCoverageRules(storeState.coverageRules, userId)

  const weeklyPlansError = weeklyPlanResults.find(result => !result.success)?.error
  const firstError =
    repsResult.error ??
    weeklyPlansError ??
    incidentsResult.error ??
    swapsResult.error ??
    coverageResult.error

  if (firstError) {
    return { success: false, error: firstError }
  }

  return { success: true }
}
