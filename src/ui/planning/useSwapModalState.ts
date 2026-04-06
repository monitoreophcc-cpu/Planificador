import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useEditMode } from '@/hooks/useEditMode'
import type { ISODate, ShiftType, SwapType } from '@/domain/types'
import { validateSwapOperation } from '@/domain/swaps/validateSwapOperation'
import {
  buildDailyEffectiveContext,
  type EffectiveSwapContext,
} from '@/domain/swaps/buildDailyEffectiveContext'
import { repName } from '@/application/presenters/humanize'
import {
  buildSwapPreviewText,
  describeExistingSwap,
  isCoverageMode,
  resolveInitialSwapModalDate,
  resolveInitialSwapModalMode,
  type SwapModalMode,
} from './swapModalHelpers'
import type { SwapModalProps } from './swapModalTypes'

export function useSwapModalState({
  weeklyPlan,
  initialDate,
  initialRepId,
  initialShift,
  existingSwap,
}: Omit<SwapModalProps, 'onClose'>) {
  const {
    representatives,
    addSwap,
    planningAnchorDate,
    incidents,
    allCalendarDaysForRelevantMonths,
    removeSwap,
    addHistoryEvent,
    swaps,
  } = useAppStore(s => ({
    representatives: s.representatives,
    addSwap: s.addSwap,
    planningAnchorDate: s.planningAnchorDate,
    incidents: s.incidents,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    removeSwap: s.removeSwap,
    addHistoryEvent: s.addHistoryEvent,
    swaps: s.swaps,
  }))

  const { createCoverage } = useCoverageStore()
  const { mode } = useEditMode()

  const [date, setDate] = useState<ISODate>(
    resolveInitialSwapModalDate(initialDate, planningAnchorDate)
  )
  const [modalMode, setModalMode] = useState<SwapModalMode>(
    resolveInitialSwapModalMode(existingSwap)
  )
  const [shift, setShift] = useState<ShiftType>(initialShift || 'DAY')
  const [type, setType] = useState<SwapType>(existingSwap?.type || 'COVER')
  const [fromId, setFromId] = useState<string>(
    initialRepId ||
      (existingSwap && 'fromRepresentativeId' in existingSwap
        ? existingSwap.fromRepresentativeId
        : '') ||
      ''
  )
  const [toId, setToId] = useState<string>(
    (existingSwap && 'toRepresentativeId' in existingSwap
      ? existingSwap.toRepresentativeId
      : existingSwap && 'representativeId' in existingSwap
        ? existingSwap.representativeId
        : '') || ''
  )
  const [note, setNote] = useState(existingSwap?.note || '')

  const validationContext = useMemo((): EffectiveSwapContext => {
    if (!weeklyPlan) return { daily: {} }

    return buildDailyEffectiveContext({
      date,
      weeklyPlan,
      swaps,
      incidents,
      allCalendarDays: allCalendarDaysForRelevantMonths,
      representatives,
    })
  }, [
    allCalendarDaysForRelevantMonths,
    date,
    incidents,
    representatives,
    swaps,
    weeklyPlan,
  ])

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

  const handleModeChange = (nextMode: SwapModalMode) => {
    setModalMode(nextMode)

    if (nextMode === 'COBERTURA') {
      setType('COVER')
      return
    }

    setType(nextMode)
  }

  return {
    addHistoryEvent,
    addSwap,
    canSubmit,
    createCoverage,
    date,
    effectiveShift,
    existingSwapDescription,
    fromId,
    incidents,
    mode,
    modalMode,
    note,
    previewText,
    removeSwap,
    representatives,
    setDate,
    setFromId,
    setNote,
    setShift,
    setToId,
    shift,
    swaps,
    toId,
    type,
    validationContext,
    validationError,
    handleModeChange,
  }
}
