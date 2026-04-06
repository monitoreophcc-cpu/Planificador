import type {
  EffectiveDutyResult,
  EffectiveDutyRole,
} from './resolveEffectiveDuty'
import type {
  Incident,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
  SwapEvent,
  WeeklyPlan,
} from '../types'
import type { DayInfo } from '../calendar/types'
import { getEffectiveSchedule } from '@/application/scheduling/specialScheduleAdapter'
import {
  findAbsenceIncidentByLookup,
  findBlockingFormalIncidentByLookup,
} from './resolveEffectiveDutyIncidentLookup'
import { applySwapEffect } from './resolveEffectiveDutySwapEffects'

export function resolveOverrideDuty(args: {
  date: ISODate
  incidents: Incident[]
  representativeId: string
  shift: ShiftType
}): EffectiveDutyResult | null {
  const { date, incidents, representativeId, shift } = args

  const overrideIncident = incidents.find(
    incident =>
      incident.representativeId === representativeId &&
      incident.type === 'OVERRIDE' &&
      incident.startDate === date
  )

  if (!overrideIncident || !overrideIncident.assignment) return null

  const assignment = overrideIncident.assignment
  let overrideRole: EffectiveDutyRole = 'NONE'
  let shouldWork = false

  if (assignment.type === 'BOTH') {
    shouldWork = true
    overrideRole = 'BASE'
  } else if (assignment.type === 'SINGLE') {
    shouldWork = assignment.shift === shift
    overrideRole = shouldWork ? 'BASE' : 'NONE'
  }

  return {
    shouldWork,
    role: overrideRole,
    reason: 'Manual Override',
    source: 'OVERRIDE',
    note: overrideIncident.note,
  }
}

export function resolvePlannedDuty(args: {
  date: ISODate
  representative: Representative
  shift: ShiftType
  specialSchedules: SpecialSchedule[]
}): EffectiveDutyResult {
  const { date, representative, shift, specialSchedules } = args

  const effective = getEffectiveSchedule({
    representative,
    dateStr: date,
    baseSchedule: representative.baseSchedule,
    specialSchedules,
  })

  let plannedRole: EffectiveDutyRole = 'NONE'
  let plannedShouldWork = false
  let source: EffectiveDutyResult['source'] = 'BASE'
  let reason: string | undefined

  if (effective.type === 'OFF') {
    plannedShouldWork = false
    plannedRole = 'NONE'
    source = effective.source ? 'EFFECTIVE_PERIOD' : 'BASE'
    reason = effective.source?.note || 'Día libre'
  } else if (
    effective.type === 'MIXTO' ||
    effective.type === 'BASE' ||
    effective.type === 'OVERRIDE'
  ) {
    source = effective.source ? 'EFFECTIVE_PERIOD' : 'BASE'
    reason = effective.source?.note

    if (effective.type === 'MIXTO') {
      plannedShouldWork = true
      plannedRole = 'BASE'
    } else {
      const matchesRequest = effective.shift === shift
      plannedShouldWork = matchesRequest
      plannedRole = matchesRequest ? 'BASE' : 'NONE'
    }
  }

  return {
    shouldWork: plannedShouldWork,
    role: plannedRole,
    source,
    reason,
  }
}

export function findBlockingFormalIncident(args: {
  allCalendarDays: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
  representativeId: string
}): Incident | undefined {
  return findBlockingFormalIncidentByLookup(args)
}

export function findAbsenceIncident(args: {
  allCalendarDays: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
  representativeId: string
}): Incident | undefined {
  return findAbsenceIncidentByLookup(args)
}

export function applyRelevantSwap(args: {
  date: ISODate
  representativeId: string
  shift: ShiftType
  swaps: SwapEvent[]
}): EffectiveDutyResult | null {
  const { date, representativeId, shift, swaps } = args
  const relevantSwaps = swaps.filter(swap => swap.date === date)

  for (const swap of relevantSwaps) {
    const swapEffect = applySwapEffect({
      representativeId,
      shift,
      swap,
    })

    if (swapEffect) {
      return swapEffect
    }
  }

  return null
}
