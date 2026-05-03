import type { ShiftType } from '../calendar/types'
import type { CommercialGoal, CommercialGoalSegment } from './types'

export const COMMERCIAL_GOAL_SEGMENTS = [
  'PART_TIME',
  'FULL_TIME',
  'MIXTO',
] as const satisfies readonly CommercialGoalSegment[]

export const COMMERCIAL_GOAL_SHIFTS = ['DAY', 'NIGHT'] as const satisfies readonly ShiftType[]

export function createCommercialGoalId(
  shift: ShiftType,
  segment: CommercialGoalSegment
) {
  return `${shift}:${segment}`
}

function normalizeMonthlyTarget(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.round(value))
}

export function createDefaultCommercialGoals(): CommercialGoal[] {
  return COMMERCIAL_GOAL_SHIFTS.flatMap(shift =>
    COMMERCIAL_GOAL_SEGMENTS.map(segment => ({
      id: createCommercialGoalId(shift, segment),
      shift,
      segment,
      monthlyTarget: 0,
    }))
  )
}

export function normalizeCommercialGoals(
  goals: CommercialGoal[] | undefined | null
): CommercialGoal[] {
  const defaults = createDefaultCommercialGoals()
  const goalsById = new Map(
    (goals ?? []).map(goal => [
      createCommercialGoalId(
        goal?.shift === 'NIGHT' ? 'NIGHT' : 'DAY',
        goal?.segment === 'MIXTO' || goal?.segment === 'PART_TIME'
          ? goal.segment
          : 'FULL_TIME'
      ),
      goal,
    ])
  )

  return defaults.map(defaultGoal => {
    const current = goalsById.get(defaultGoal.id)

    if (!current) {
      return defaultGoal
    }

    return {
      id: defaultGoal.id,
      shift: defaultGoal.shift,
      segment: defaultGoal.segment,
      monthlyTarget: normalizeMonthlyTarget(current.monthlyTarget),
    }
  })
}

export function getCommercialGoalTarget(
  goals: CommercialGoal[] | undefined,
  shift: ShiftType,
  segment: CommercialGoalSegment
): number {
  const goal = normalizeCommercialGoals(goals).find(
    item => item.shift === shift && item.segment === segment
  )

  return goal?.monthlyTarget ?? 0
}
