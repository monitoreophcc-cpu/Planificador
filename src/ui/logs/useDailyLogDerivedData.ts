'use client'

import type {
  DayInfo,
  Incident,
  IncidentType,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
} from '@/domain/types'
import type { DailyLogFilterMode } from './dailyLogTypes'
import { useDailyLogIncidentDerived } from './useDailyLogIncidentDerived'
import { useDailyLogOperationalDerived } from './useDailyLogOperationalDerived'

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
  const operational = useDailyLogOperationalDerived({
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
  })

  const incidentDerived = useDailyLogIncidentDerived({
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
  })

  return {
    activeCoveragesForDay: operational.activeCoveragesForDay,
    activeWeeklyPlan: operational.activeWeeklyPlan,
    baseRepresentativeList: operational.baseRepresentativeList,
    conflictCheck: incidentDerived.conflictCheck,
    dailyStats: operational.dailyStats,
    dayIncidents: incidentDerived.dayIncidents,
    ongoingIncidents: incidentDerived.ongoingIncidents,
    representativeRows: operational.representativeRows,
  }
}
