'use client'

import { getDailyShiftStats } from '@/application/ui-adapters/getDailyShiftStats'
import { getPlannedAgentsForDay } from '@/application/ui-adapters/getPlannedAgentsForDay'
import type {
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
  WeeklyPlan,
} from '@/domain/types'

interface GetBaseRepresentativeListParams {
  activeShift: ShiftType
  activeWeeklyPlan: WeeklyPlan | null
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  isAdministrativeIncident: boolean
  logDate: ISODate
  representatives: Representative[]
  specialSchedules: SpecialSchedule[]
}

export function getBaseRepresentativeList({
  activeShift,
  activeWeeklyPlan,
  allCalendarDaysForRelevantMonths,
  incidents,
  isAdministrativeIncident,
  logDate,
  representatives,
  specialSchedules,
}: GetBaseRepresentativeListParams) {
  if (isAdministrativeIncident) {
    return representatives.filter(representative => representative.isActive)
  }

  if (!activeWeeklyPlan) {
    return []
  }

  const plannedAgentsForShift = getPlannedAgentsForDay(
    representatives,
    incidents,
    logDate,
    activeShift,
    allCalendarDaysForRelevantMonths,
    specialSchedules
  )

  const representativeById = new Map(
    representatives.map(representative => [representative.id, representative])
  )

  return plannedAgentsForShift
    .map(agent => representativeById.get(agent.representativeId))
    .filter(
      (representative): representative is Representative =>
        !!representative && representative.isActive
    )
}

interface GetDailyStatsParams {
  activeWeeklyPlan: WeeklyPlan | null
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  isLoading: boolean
  logDate: ISODate
  representatives: Representative[]
  specialSchedules: SpecialSchedule[]
}

export function getDailyStats({
  activeWeeklyPlan,
  allCalendarDaysForRelevantMonths,
  incidents,
  isLoading,
  logDate,
  representatives,
  specialSchedules,
}: GetDailyStatsParams) {
  if (!activeWeeklyPlan?.agents?.length || isLoading) {
    return { dayPresent: 0, dayPlanned: 0, nightPresent: 0, nightPlanned: 0 }
  }

  const dayStats = getDailyShiftStats(
    activeWeeklyPlan,
    incidents,
    logDate,
    'DAY',
    allCalendarDaysForRelevantMonths,
    representatives,
    specialSchedules
  )

  const nightStats = getDailyShiftStats(
    activeWeeklyPlan,
    incidents,
    logDate,
    'NIGHT',
    allCalendarDaysForRelevantMonths,
    representatives,
    specialSchedules
  )

  return {
    dayPresent: dayStats.present,
    dayPlanned: dayStats.planned,
    nightPresent: nightStats.present,
    nightPlanned: nightStats.planned,
  }
}
