'use client'

import {
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { getOngoingIncidents } from '@/application/ui-adapters/getOngoingIncidents'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import type {
  DayInfo,
  Incident,
  ISODate,
  Representative,
} from '@/domain/types'
import type { EnrichedIncident } from './logHelpers'
import type { DailyLogFilterMode } from './dailyLogTypes'

interface GetVisibleOngoingIncidentsParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
}

interface GetDayIncidentsParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  filterMode: DailyLogFilterMode
  incidents: Incident[]
  isLoading: boolean
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
