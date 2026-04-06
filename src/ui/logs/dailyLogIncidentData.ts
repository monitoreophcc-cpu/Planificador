'use client'

import {
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { getOngoingIncidents } from '@/application/ui-adapters/getOngoingIncidents'
import { checkIncidentConflicts } from '@/domain/incidents/checkIncidentConflicts'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  IncidentType,
  ISODate,
  Representative,
} from '@/domain/types'
import type { EnrichedIncident } from './logHelpers'
import type { DailyLogFilterMode } from './dailyLogTypes'

interface GetFilteredRepresentativesParams {
  baseRepresentativeList: Representative[]
  hideAbsent: boolean
  incidents: Incident[]
  logDate: ISODate
  searchTerm: string
}

export function getFilteredRepresentatives({
  baseRepresentativeList,
  hideAbsent,
  incidents,
  logDate,
  searchTerm,
}: GetFilteredRepresentativesParams) {
  let result = baseRepresentativeList

  if (hideAbsent) {
    result = result.filter(representative => {
      const isAbsent = incidents.some(
        incident =>
          incident.representativeId === representative.id &&
          incident.type === 'AUSENCIA' &&
          incident.startDate === logDate
      )
      return !isAbsent
    })
  }

  if (!searchTerm) {
    return result
  }

  const normalizedSearch = searchTerm.toLowerCase()
  return result.filter(representative =>
    representative.name.toLowerCase().includes(normalizedSearch)
  )
}

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

interface GetVisibleOngoingIncidentsParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
}

export function getVisibleOngoingIncidents({
  allCalendarDaysForRelevantMonths,
  incidents,
  isLoading,
  logDate,
  representatives,
}: GetVisibleOngoingIncidentsParams) {
  if (isLoading) {
    return []
  }

  return getOngoingIncidents(
    incidents,
    representatives,
    logDate,
    allCalendarDaysForRelevantMonths
  )
}

interface GetDayIncidentsParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  filterMode: DailyLogFilterMode
  incidents: Incident[]
  isLoading: boolean
  representatives: Representative[]
}

export function getDayIncidents({
  allCalendarDaysForRelevantMonths,
  dateForLog,
  filterMode,
  incidents,
  isLoading,
  representatives,
}: GetDayIncidentsParams) {
  if (isLoading) {
    return []
  }

  const representativeById = new Map(
    representatives.map(representative => [representative.id, representative])
  )

  const { rangeStart, rangeEnd } = resolveFilterRange(filterMode, dateForLog)

  const candidates = incidents.map(incident => {
    if (
      incident.type === 'OVERRIDE' ||
      incident.type === 'VACACIONES' ||
      incident.type === 'LICENCIA'
    ) {
      return null
    }

    const representative = representativeById.get(incident.representativeId)
    if (!representative) {
      return null
    }

    const resolved = resolveIncidentDates(
      incident,
      allCalendarDaysForRelevantMonths,
      representative
    )

    const isVisible = resolved.dates.some(dateString => {
      const date = parseISO(dateString)
      return date >= rangeStart && date <= rangeEnd
    })

    if (!isVisible) {
      return null
    }

    const enrichedIncident: EnrichedIncident = {
      ...incident,
      repName: representative.name,
      repShift: representative.baseShift,
      dayCount: 1,
      totalDuration: 1,
      returnDate: incident.startDate,
      progressRatio: 1,
    }

    return enrichedIncident
  })

  return candidates.filter(
    (incident): incident is EnrichedIncident => incident !== null
  )
}

function resolveFilterRange(filterMode: DailyLogFilterMode, dateForLog: Date) {
  if (filterMode === 'WEEK') {
    return {
      rangeStart: startOfWeek(dateForLog, { weekStartsOn: 1 }),
      rangeEnd: endOfWeek(dateForLog, { weekStartsOn: 1 }),
    }
  }

  if (filterMode === 'MONTH') {
    return {
      rangeStart: startOfMonth(dateForLog),
      rangeEnd: endOfMonth(dateForLog),
    }
  }

  return {
    rangeStart: dateForLog,
    rangeEnd: dateForLog,
  }
}
