'use client'

import { useAppStore } from '@/store/useAppStore'
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
import { isRepresentativeInvolvedInSwap } from './planningSectionTypes'
import {
  findBlockingPlanningIncident,
  findExistingOverrideIncident,
  findPlanningRepresentative,
  getPlannerDayAssignment,
  resolveOverrideAssignment,
} from './planningSectionOverrideHelpers'

interface TogglePlanningOverrideParams {
  activeShift: ShiftType
  addIncident: (
    input: IncidentInput,
    allowOverride?: boolean
  ) => Promise<{ ok: boolean; newId?: string; reason?: string }>
  allCalendarDaysForRelevantMonths: DayInfo[]
  buildOverrideIncidentInput: (args: {
    date: ISODate
    previousAssignment: ShiftAssignment
    representativeId: string
  }) => IncidentInput
  date: ISODate
  incidents: Incident[]
  pushUndo: (entry: { label: string; undo: () => void }) => void
  representativeId: string
  representatives: Representative[]
  showMixedShiftConfirmModal: (
    representativeId: string,
    date: ISODate,
    shift: ShiftType
  ) => Promise<ShiftAssignment | null>
  weeklyPlan: WeeklyPlan | null
}

export async function togglePlanningOverride({
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
}: TogglePlanningOverrideParams) {
  if (!weeklyPlan) {
    return
  }

  const representative = findPlanningRepresentative(representatives, representativeId)
  if (!representative) {
    return
  }

  const blockingIncident = findBlockingPlanningIncident({
    allCalendarDaysForRelevantMonths,
    date,
    incidents,
    representative,
  })

  if (blockingIncident) {
    return
  }

  const existingOverride = findExistingOverrideIncident({
    date,
    incidents,
    representativeId,
  })

  if (existingOverride) {
    removeOverrideAndRelatedSwaps({
      date,
      overrideId: existingOverride.id,
      representativeId,
    })

    pushUndo({
      label: `Reaplicar cambio de turno de ${representative.name}`,
      undo: () => restoreOverrideIncident(existingOverride),
    })
    return
  }

  const previousAssignment = getPlannerDayAssignment({
    date,
    representativeId,
    weeklyPlan,
  })

  const finalAssignment = await resolveOverrideAssignment({
    activeShift,
    date,
    previousAssignment,
    representativeId,
    showMixedShiftConfirmModal,
  })

  if (finalAssignment === null) {
    return
  }

  const incidentInput: IncidentInput = {
    ...buildOverrideIncidentInput({
      date,
      previousAssignment,
      representativeId,
    }),
    assignment: finalAssignment,
  }

  const result = await addIncident(incidentInput, true)

  if (result.ok && result.newId) {
    pushUndo({
      label: `Deshacer cambio de turno de ${representative.name}`,
      undo: () => {
        removeOverrideAndRelatedSwaps({
          date,
          overrideId: result.newId!,
          representativeId,
        })
      },
    })
  }
}

function removeOverrideAndRelatedSwaps(args: {
  date: ISODate
  overrideId: string
  representativeId: string
}) {
  const { date, overrideId, representativeId } = args

  useAppStore.setState(state => {
    state.incidents = state.incidents.filter(
      incident => incident.id !== overrideId
    )

    state.swaps = state.swaps.filter(swap => {
      if (swap.date !== date) {
        return true
      }

      return !isRepresentativeInvolvedInSwap(swap, representativeId)
    })
  })
}

function restoreOverrideIncident(incident: Incident) {
  useAppStore.setState(state => {
    state.incidents.push(incident)
  })
}
