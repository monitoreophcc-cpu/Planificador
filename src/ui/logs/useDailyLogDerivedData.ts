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
import {
  getConflictCheck,
  getDayIncidents,
  getFilteredRepresentatives,
  getVisibleOngoingIncidents,
} from './dailyLogIncidentData'
import type { DailyLogFilterMode } from './dailyLogTypes'

interface UseDailyLogDerivedDataParams {
  activeShift: ShiftType
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  duration: number
  filterMode: DailyLogFilterMode
  hideAbsent: boolean
  incidentType: IncidentType
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
  searchTerm: string
  selectedRep: Representative | null
  specialSchedules: SpecialSchedule[]
}

export function useDailyLogDerivedData({
  activeShift,
  allCalendarDaysForRelevantMonths,
  dateForLog,
  duration,
  filterMode,
  hideAbsent,
  incidentType,
  incidents,
  isLoading,
  logDate,
  representatives,
  searchTerm,
  selectedRep,
  specialSchedules,
}: UseDailyLogDerivedDataParams) {
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
    conflictCheck,
    dailyStats,
    dayIncidents,
    ongoingIncidents,
    representativeRows,
  }
}
