import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useEditMode } from '@/hooks/useEditMode'
import {
  type SwapModalMode,
} from './swapModalHelpers'
import type { SwapModalProps } from './swapModalTypes'
import {
  createInitialSwapModalState,
  resolveSwapTypeFromMode,
} from './swapModalStateHelpers'
import { useSwapModalDerivedState } from './useSwapModalDerivedState'

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

  const initialState = createInitialSwapModalState({
    existingSwap,
    initialDate,
    initialRepId,
    initialShift,
    planningAnchorDate,
  })

  const [date, setDate] = useState(initialState.date)
  const [modalMode, setModalMode] = useState<SwapModalMode>(initialState.modalMode)
  const [shift, setShift] = useState(initialState.shift)
  const [type, setType] = useState(initialState.type)
  const [fromId, setFromId] = useState(initialState.fromId)
  const [toId, setToId] = useState(initialState.toId)
  const [note, setNote] = useState(initialState.note)

  const {
    canSubmit,
    effectiveShift,
    existingSwapDescription,
    previewText,
    validationContext,
    validationError,
  } = useSwapModalDerivedState({
    allCalendarDays: allCalendarDaysForRelevantMonths,
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
  })

  const handleModeChange = (nextMode: SwapModalMode) => {
    setModalMode(nextMode)
    setType(resolveSwapTypeFromMode(nextMode))
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
    toId,
    type,
    validationContext,
    validationError,
    handleModeChange,
  }
}
