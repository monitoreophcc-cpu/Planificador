'use client'

import { useMemo } from 'react'
import { useCoverageStore } from '@/store/useCoverageStore'
import type {
  DayInfo,
  Incident,
  IncidentType,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
} from '@/domain/types'
import {
  buildActiveWeeklyPlan,
  buildCoverageByRepId,
  buildRepresentativeRows,
  getBaseRepresentativeList,
  getDailyStats,
} from './dailyLogOperationalData'
import { getFilteredRepresentatives } from './dailyLogIncidentData'

interface UseDailyLogOperationalDerivedParams {
  activeShift: ShiftType
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  hideAbsent: boolean
  incidentType: IncidentType
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
  searchTerm: string
  specialSchedules: SpecialSchedule[]
}

export function useDailyLogOperationalDerived({
  activeShift,
  allCalendarDaysForRelevantMonths,
  dateForLog,
  hideAbsent,
  incidentType,
  incidents,
  isLoading,
  logDate,
  representatives,
  searchTerm,
  specialSchedules,
}: UseDailyLogOperationalDerivedParams) {
  const coverages = useCoverageStore(state => state.coverages)

  const activeCoveragesForDay = useMemo(
    () =>
      coverages.filter(
        coverage => coverage.status === 'ACTIVE' && coverage.date === logDate
      ),
    [coverages, logDate]
  )

  const coverageByRepId = useMemo(
    () =>
      buildCoverageByRepId({
        activeCoveragesForDay,
        activeShift,
        logDate,
        representatives,
      }),
    [representatives, logDate, activeCoveragesForDay, activeShift]
  )

  const activeWeeklyPlan = useMemo(
    () =>
      buildActiveWeeklyPlan({
        allCalendarDaysForRelevantMonths,
        dateForLog,
        incidents,
        representatives,
        specialSchedules,
      }),
    [
      dateForLog,
      allCalendarDaysForRelevantMonths,
      representatives,
      incidents,
      specialSchedules,
    ]
  )

  const isAdministrativeIncident =
    incidentType === 'LICENCIA' || incidentType === 'VACACIONES'

  const baseRepresentativeList = useMemo(
    () =>
      getBaseRepresentativeList({
        activeShift,
        activeWeeklyPlan,
        allCalendarDaysForRelevantMonths,
        incidents,
        isAdministrativeIncident,
        logDate,
        representatives,
        specialSchedules,
      }),
    [
      isAdministrativeIncident,
      representatives,
      activeWeeklyPlan,
      incidents,
      logDate,
      activeShift,
      allCalendarDaysForRelevantMonths,
      specialSchedules,
    ]
  )

  const filteredRepresentatives = useMemo(
    () =>
      getFilteredRepresentatives({
        baseRepresentativeList,
        hideAbsent,
        incidents,
        logDate,
        searchTerm,
      }),
    [baseRepresentativeList, searchTerm, hideAbsent, incidents, logDate]
  )

  const dailyStats = useMemo(
    () =>
      getDailyStats({
        activeWeeklyPlan,
        allCalendarDaysForRelevantMonths,
        incidents,
        isLoading,
        logDate,
        representatives,
        specialSchedules,
      }),
    [
      activeWeeklyPlan,
      isLoading,
      incidents,
      logDate,
      allCalendarDaysForRelevantMonths,
      representatives,
      specialSchedules,
    ]
  )

  const representativeRows = useMemo(
    () =>
      buildRepresentativeRows({
        activeCoveragesForDay,
        activeShift,
        activeWeeklyPlan,
        coverageByRepId,
        filteredRepresentatives,
        incidents,
        logDate,
        representatives,
      }),
    [
      filteredRepresentatives,
      logDate,
      activeShift,
      incidents,
      activeWeeklyPlan,
      activeCoveragesForDay,
      representatives,
      coverageByRepId,
    ]
  )

  return {
    activeCoveragesForDay,
    activeWeeklyPlan,
    baseRepresentativeList,
    dailyStats,
    representativeRows,
  }
}
