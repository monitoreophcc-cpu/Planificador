'use client'

import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
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
import type { OverrideIncident } from './planningSectionTypes'

export function findPlanningRepresentative(
  representatives: Representative[],
  representativeId: string
) {
  return representatives.find(representative => representative.id === representativeId)
}

export function findBlockingPlanningIncident(params: {
  allCalendarDaysForRelevantMonths: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
}) {
  const {
    allCalendarDaysForRelevantMonths,
    date,
    incidents,
    representative,
  } = params

  return incidents.find(incident => {
    if (incident.representativeId !== representative.id) {
      return false
    }

    if (!['VACACIONES', 'LICENCIA'].includes(incident.type)) {
      return false
    }

    const resolved = resolveIncidentDates(
      incident,
      allCalendarDaysForRelevantMonths,
      representative
    )

    if (resolved.start && resolved.returnDate) {
      return date >= resolved.start && date < resolved.returnDate
    }

    return false
  })
}

export function findExistingOverrideIncident(params: {
  date: ISODate
  incidents: Incident[]
  representativeId: string
}): OverrideIncident | undefined {
  const { date, incidents, representativeId } = params

  return incidents.find(
    incident =>
      incident.representativeId === representativeId &&
      incident.startDate === date &&
      incident.type === 'OVERRIDE'
  ) as OverrideIncident | undefined
}

export function getPlannerDayAssignment(params: {
  date: ISODate
  representativeId: string
  weeklyPlan: WeeklyPlan
}) {
  const { date, representativeId, weeklyPlan } = params
  const agentPlan = weeklyPlan.agents.find(
    agent => agent.representativeId === representativeId
  )

  return agentPlan?.days[date]?.assignment ?? { type: 'NONE' as const }
}

export async function resolveOverrideAssignment(params: {
  activeShift: ShiftType
  date: ISODate
  previousAssignment: ShiftAssignment
  representativeId: string
  showMixedShiftConfirmModal: (
    representativeId: string,
    date: ISODate,
    shift: ShiftType
  ) => Promise<ShiftAssignment | null>
}) {
  const {
    activeShift,
    date,
    previousAssignment,
    representativeId,
    showMixedShiftConfirmModal,
  } = params

  if (previousAssignment.type === 'BOTH') {
    return showMixedShiftConfirmModal(representativeId, date, activeShift)
  }

  const isCurrentlyWorking =
    previousAssignment.type === 'SINGLE' &&
    previousAssignment.shift === activeShift

  return isCurrentlyWorking
    ? ({ type: 'NONE' } as const)
    : ({ type: 'SINGLE', shift: activeShift } as const)
}

export function buildOverrideIncidentInput(params: {
  date: ISODate
  previousAssignment: ShiftAssignment
  representativeId: string
}) {
  const { date, previousAssignment, representativeId } = params

  return {
    representativeId,
    startDate: date,
    type: 'OVERRIDE',
    duration: 1,
    assignment: previousAssignment,
    previousAssignment,
    note: undefined,
  } satisfies IncidentInput
}

export function buildPlanningCommentInput(params: {
  currentAssignment: ShiftAssignment
  date: ISODate
  note: string | undefined
  representativeId: string
}) {
  const { currentAssignment, date, note, representativeId } = params

  return {
    representativeId,
    startDate: date,
    type: 'OVERRIDE',
    duration: 1,
    assignment: currentAssignment,
    previousAssignment: currentAssignment,
    note,
  } satisfies IncidentInput
}
