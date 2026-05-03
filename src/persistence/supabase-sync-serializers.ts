import type {
  CommercialGoal,
  CoverageRule,
  Incident,
  Representative,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { SyncRow } from './supabase-sync-types'

export function serializeRepresentatives(
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
    employment_type: representative.employmentType ?? 'FULL_TIME',
    commercial_eligible: representative.commercialEligible === true,
    is_active: representative.isActive,
    order_index: representative.orderIndex,
    updated_at: updatedAt,
  }))
}

export function serializeCommercialGoals(
  commercialGoals: CommercialGoal[],
  userId: string
): SyncRow[] {
  const updatedAt = new Date().toISOString()

  return commercialGoals.map(goal => ({
    id: goal.id,
    user_id: userId,
    shift: goal.shift,
    segment: goal.segment,
    monthly_target: goal.monthlyTarget,
    updated_at: updatedAt,
  }))
}

export function serializeWeeklyPlans(
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

export function serializeIncidents(
  incidents: Incident[],
  userId: string
): SyncRow[] {
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

export function serializeSwaps(swaps: SwapEvent[], userId: string): SyncRow[] {
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

export function serializeCoverageRules(
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
