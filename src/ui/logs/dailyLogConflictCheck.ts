'use client'

import { checkIncidentConflicts } from '@/domain/incidents/checkIncidentConflicts'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  IncidentType,
  ISODate,
  Representative,
} from '@/domain/types'

interface GetConflictCheckParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  duration: number
  incidentType: IncidentType
  incidents: Incident[]
  logDate: ISODate
  selectedRep: Representative | null
}

export function getConflictCheck({
  allCalendarDaysForRelevantMonths,
  duration,
  incidentType,
  incidents,
  logDate,
  selectedRep,
}: GetConflictCheckParams): ReturnType<typeof checkIncidentConflicts> {
  if (!selectedRep) {
    return { hasConflict: false, messages: [] as string[] }
  }

  const input: IncidentInput = {
    representativeId: selectedRep.id,
    startDate: logDate,
    type: incidentType,
    duration:
      incidentType === 'LICENCIA' || incidentType === 'VACACIONES'
        ? duration
        : 1,
  }

  return checkIncidentConflicts(
    input.representativeId,
    input.startDate,
    input.type,
    input.duration,
    incidents,
    allCalendarDaysForRelevantMonths,
    selectedRep
  )
}
