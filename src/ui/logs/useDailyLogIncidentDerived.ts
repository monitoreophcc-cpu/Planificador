'use client'

import { useMemo } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentType,
  ISODate,
  Representative,
} from '@/domain/types'
import {
  getConflictCheck,
  getDayIncidents,
  getVisibleOngoingIncidents,
} from './dailyLogIncidentData'
import type { DailyLogFilterMode } from './dailyLogTypes'

interface UseDailyLogIncidentDerivedParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  duration: number
  filterMode: DailyLogFilterMode
  incidentType: IncidentType
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
  selectedRep: Representative | null
}

export function useDailyLogIncidentDerived({
  allCalendarDaysForRelevantMonths,
  dateForLog,
  duration,
  filterMode,
  incidentType,
  incidents,
  isLoading,
  logDate,
  representatives,
  selectedRep,
}: UseDailyLogIncidentDerivedParams) {
  const conflictCheck = useMemo(
    () =>
      getConflictCheck({
        allCalendarDaysForRelevantMonths,
        duration,
        incidentType,
        incidents,
        logDate,
        selectedRep,
      }),
    [
      selectedRep,
      incidentType,
      logDate,
      duration,
      incidents,
      allCalendarDaysForRelevantMonths,
    ]
  )

  const ongoingIncidents = useMemo(
    () =>
      getVisibleOngoingIncidents({
        allCalendarDaysForRelevantMonths,
        incidents,
        isLoading,
        logDate,
        representatives,
      }),
    [
      incidents,
      representatives,
      logDate,
      allCalendarDaysForRelevantMonths,
      isLoading,
    ]
  )

  const dayIncidents = useMemo(
    () =>
      getDayIncidents({
        allCalendarDaysForRelevantMonths,
        dateForLog,
        filterMode,
        incidents,
        isLoading,
        representatives,
      }),
    [
      dateForLog,
      allCalendarDaysForRelevantMonths,
      incidents,
      representatives,
      isLoading,
      filterMode,
    ]
  )

  return {
    conflictCheck,
    dayIncidents,
    ongoingIncidents,
  }
}
