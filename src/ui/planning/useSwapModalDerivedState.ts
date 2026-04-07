import { useMemo, type ReactNode } from 'react'
import type {
  DayInfo,
  Representative,
  ShiftType,
  SwapEvent,
  SwapType,
  WeeklyPlan,
} from '@/domain/types'
import { validateSwapOperation } from '@/domain/swaps/validateSwapOperation'
import {
  buildDailyEffectiveContext,
  type EffectiveSwapContext,
} from '@/domain/swaps/buildDailyEffectiveContext'
import {
  buildSwapPreviewText,
  describeExistingSwap,
  isCoverageMode,
  type SwapModalMode,
} from './swapModalHelpers'

type UseSwapModalDerivedStateArgs = {
  allCalendarDays: DayInfo[]
  date: string
  existingSwap?: SwapEvent
  fromId: string
  incidents: import('@/domain/types').Incident[]
  modalMode: SwapModalMode
  representatives: Representative[]
  shift: ShiftType
  swaps: SwapEvent[]
  toId: string
  type: SwapType
  weeklyPlan: WeeklyPlan
}

type SwapModalDerivedState = {
  canSubmit: boolean
  effectiveShift: ShiftType
  existingSwapDescription: string
  previewText: ReactNode | null
  validationContext: EffectiveSwapContext
  validationError: string | null
}

export function useSwapModalDerivedState({
  allCalendarDays,
  date,
  existingSwap,
  fromId,
  incidents,
  modalMode,
  representatives,
  shift,
  swaps,
  toId,
  type,
  weeklyPlan,
}: UseSwapModalDerivedStateArgs): SwapModalDerivedState {
  const validationContext = useMemo((): EffectiveSwapContext => {
    if (!weeklyPlan) return { daily: {} }

    return buildDailyEffectiveContext({
      date,
      weeklyPlan,
      swaps,
      incidents,
      allCalendarDays,
      representatives,
    })
  }, [allCalendarDays, date, incidents, representatives, swaps, weeklyPlan])

  const effectiveShift = useMemo(() => {
    if (type === 'COVER' && fromId && validationContext.daily[fromId]) {
      const day = validationContext.daily[fromId]
      const baseShifts = Array.from(day.baseShifts)

      if (baseShifts.length === 1) {
        return baseShifts[0]
      }
    }

    return shift
  }, [fromId, shift, type, validationContext])

  const validationError = useMemo(() => {
    if (!type || !date) return null

    return validateSwapOperation(
      type,
      fromId,
      toId,
      effectiveShift,
      validationContext
    )
  }, [date, effectiveShift, fromId, toId, type, validationContext])

  const canSubmit = useMemo(() => {
    if (validationError) return false
    if (isCoverageMode(modalMode)) return Boolean(fromId && toId && date)
    if (type === 'DOUBLE') return Boolean(toId && date)
    if (type === 'COVER' || type === 'SWAP') return Boolean(fromId && toId && date)
    return false
  }, [date, fromId, modalMode, toId, type, validationError])

  const previewText = useMemo(
    () =>
      buildSwapPreviewText({
        mode: modalMode,
        type,
        canSubmit,
        fromId,
        toId,
        shift,
        effectiveShift,
        validationContext,
        representatives,
      }),
    [
      canSubmit,
      effectiveShift,
      fromId,
      modalMode,
      representatives,
      shift,
      toId,
      type,
      validationContext,
    ]
  )

  const existingSwapDescription = useMemo(() => {
    if (!existingSwap) return ''
    return describeExistingSwap(existingSwap, representatives)
  }, [existingSwap, representatives])

  return {
    canSubmit,
    effectiveShift,
    existingSwapDescription,
    previewText,
    validationContext,
    validationError,
  }
}
