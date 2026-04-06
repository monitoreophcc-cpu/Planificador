'use client'

import { useState, type MouseEvent } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  ISODate,
  Representative,
  ShiftAssignment,
  ShiftType,
  WeeklyPlan,
} from '@/domain/types'
import { createClosedSwapModalState } from './planningSectionTypes'
import { handlePlanningComment } from './planningSectionCommentFlow'
import { togglePlanningOverride } from './planningSectionOverrideFlow'
import { usePlanningSectionPromptDialog } from './usePlanningSectionPromptDialog'
import {
  buildPlanningCommentInput,
  buildOverrideIncidentInput,
} from './planningSectionOverrideHelpers'

interface UsePlanningSectionActionsParams {
  activeShift: ShiftType
  addIncident: (
    input: IncidentInput,
    allowOverride?: boolean
  ) => Promise<{ ok: boolean; newId?: string; reason?: string }>
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  planningAnchorDate: ISODate
  pushUndo: (entry: { label: string; undo: () => void }) => void
  representatives: Representative[]
  showMixedShiftConfirmModal: (
    representativeId: string,
    date: ISODate,
    shift: ShiftType
  ) => Promise<ShiftAssignment | null>
  weeklyPlan: WeeklyPlan | null
}

export function usePlanningSectionActions({
  activeShift,
  addIncident,
  allCalendarDaysForRelevantMonths,
  incidents,
  planningAnchorDate,
  pushUndo,
  representatives,
  showMixedShiftConfirmModal,
  weeklyPlan,
}: UsePlanningSectionActionsParams) {
  const [swapModalState, setSwapModalState] = useState(
    createClosedSwapModalState()
  )
  const { promptConfig, showConfirmWithInput } = usePlanningSectionPromptDialog()

  const handleOpenSwapManager = () => {
    setSwapModalState({
      isOpen: true,
      repId: null,
      date: planningAnchorDate,
      shift: activeShift,
      existingSwap: null,
    })
  }

  const handleCloseSwapModal = () => {
    setSwapModalState(createClosedSwapModalState())
  }

  const handleTogglePlanOverride = async (
    representativeId: string,
    date: ISODate
  ) => {
    await togglePlanningOverride({
      activeShift,
      addIncident,
      allCalendarDaysForRelevantMonths,
      buildOverrideIncidentInput,
      date,
      incidents,
      pushUndo,
      representativeId,
      representatives,
      showMixedShiftConfirmModal,
      weeklyPlan,
    })
  }

  const handleCellContextMenu = async (
    representativeId: string,
    date: ISODate,
    event: MouseEvent
  ) => {
    event.preventDefault()

    await handlePlanningComment({
      addIncident,
      buildPlanningCommentInput,
      date,
      incidents,
      representativeId,
      showConfirmWithInput,
      weeklyPlan,
    })
  }

  return {
    handleCellContextMenu,
    handleCloseSwapModal,
    handleOpenSwapManager,
    promptConfig,
    swapModalState,
    togglePlanOverride: handleTogglePlanOverride,
  }
}
