import type { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import type { CommercialGoal, CommercialGoalSegment, ShiftType } from '@/domain/types'
import {
  createCommercialGoalId,
  normalizeCommercialGoals,
} from '@/domain/commercialGoals/defaults'
import type { AppState } from './useAppStore'
import { canCurrentUserEditData } from './useAccessStore'

export interface CommercialGoalSlice {
  upsertCommercialGoal: (
    goal: Pick<CommercialGoal, 'shift' | 'segment' | 'monthlyTarget'>
  ) => void
  replaceCommercialGoals: (goals: CommercialGoal[]) => void
}

function normalizeTarget(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.round(value))
}

type CommercialGoalInput = {
  shift: ShiftType
  segment: CommercialGoalSegment
  monthlyTarget: number
}

function upsertGoal(
  goals: CommercialGoal[],
  input: CommercialGoalInput
): CommercialGoal[] {
  const id = createCommercialGoalId(input.shift, input.segment)
  const nextGoals = goals.filter(goal => goal.id !== id)

  nextGoals.push({
    id,
    shift: input.shift,
    segment: input.segment,
    monthlyTarget: normalizeTarget(input.monthlyTarget),
  })

  return normalizeCommercialGoals(nextGoals)
}

export const createCommercialGoalSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  CommercialGoalSlice
> = set => ({
  upsertCommercialGoal: goal => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] upsertCommercialGoal bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.commercialGoals = upsertGoal(state.commercialGoals ?? [], goal)
    })
  },

  replaceCommercialGoals: goals => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] replaceCommercialGoals bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.commercialGoals = normalizeCommercialGoals(goals)
    })
  },
})
