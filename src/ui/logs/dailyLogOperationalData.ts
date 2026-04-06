'use client'

import { addDays, format, startOfWeek } from 'date-fns'
import { getDailyShiftStats } from '@/application/ui-adapters/getDailyShiftStats'
import { getPlannedAgentsForDay } from '@/application/ui-adapters/getPlannedAgentsForDay'
import { findCoverageForDay } from '@/domain/planning/coverage'
import { isSlotOperationallyEmpty } from '@/domain/planning/isSlotOperationallyEmpty'
import { buildWeeklySchedule } from '@/domain/planning/buildWeeklySchedule'
import { resolveSlotResponsibility } from '@/domain/planning/resolveSlotResponsibility'
import type { Coverage } from '@/domain/planning/coverage'
import type {
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
  WeeklyPlan,
} from '@/domain/types'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'

type CoverageLookup = ReturnType<typeof findCoverageForDay>

interface BuildActiveWeeklyPlanParams {
  allCalendarDaysForRelevantMonths: DayInfo[]
  dateForLog: Date
  incidents: Incident[]
  representatives: Representative[]
  specialSchedules: SpecialSchedule[]
}

export function buildActiveWeeklyPlan({
  allCalendarDaysForRelevantMonths,
  dateForLog,
  incidents,
  representatives,
  specialSchedules,
}: BuildActiveWeeklyPlanParams): WeeklyPlan | null {
  if (allCalendarDaysForRelevantMonths.length === 0) {
    return null
  }

  const weekStart = startOfWeek(dateForLog, { weekStartsOn: 1 })
  const weekDays: DayInfo[] = []

  for (let index = 0; index < 7; index += 1) {
    const dateString = format(addDays(weekStart, index), 'yyyy-MM-dd')
    const calendarDay = allCalendarDaysForRelevantMonths.find(
      day => day.date === dateString
    )

    if (calendarDay) {
      weekDays.push(calendarDay)
    }
  }

  if (weekDays.length !== 7) {
    return null
  }

  return buildWeeklySchedule(
    representatives,
    incidents,
    specialSchedules,
    weekDays,
    allCalendarDaysForRelevantMonths
  )
}

interface BuildCoverageByRepIdParams {
  activeCoveragesForDay: Coverage[]
  activeShift: ShiftType
  logDate: ISODate
  representatives: Representative[]
}

export function buildCoverageByRepId({
  activeCoveragesForDay,
  activeShift,
  logDate,
  representatives,
}: BuildCoverageByRepIdParams) {
  const map = new Map<string, CoverageLookup>()

  for (const representative of representatives) {
    map.set(
      representative.id,
      findCoverageForDay(
        representative.id,
        logDate,
        activeCoveragesForDay,
        activeShift
      )
    )
  }

  return map
}

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

interface BuildRepresentativeRowsParams {
  activeCoveragesForDay: Coverage[]
  activeShift: ShiftType
  activeWeeklyPlan: WeeklyPlan | null
  coverageByRepId: Map<string, CoverageLookup>
  filteredRepresentatives: Representative[]
  incidents: Incident[]
  logDate: ISODate
  representatives: Representative[]
}

export function buildRepresentativeRows({
  activeCoveragesForDay,
  activeShift,
  activeWeeklyPlan,
  coverageByRepId,
  filteredRepresentatives,
  incidents,
  logDate,
  representatives,
}: BuildRepresentativeRowsParams): DailyLogRepresentativeRow[] {
  const representativeById = new Map(
    representatives.map(representative => [representative.id, representative])
  )

  return filteredRepresentatives.map(representative => {
    const isOperationallyAbsent = isSlotOperationallyEmpty(
      representative.id,
      logDate,
      activeShift,
      incidents
    )

    const isAbsent = incidents.some(
      incident =>
        incident.representativeId === representative.id &&
        incident.type === 'AUSENCIA' &&
        incident.startDate === logDate
    )

    const resolution = activeWeeklyPlan
      ? resolveSlotResponsibility(
          representative.id,
          logDate,
          activeShift,
          activeWeeklyPlan,
          activeCoveragesForDay,
          representatives
        )
      : null

    const isUnassigned = resolution?.kind === 'UNASSIGNED'
    const isCovered =
      resolution?.kind === 'RESOLVED' && resolution.source === 'COVERAGE'

    const coverage = coverageByRepId.get(representative.id)
    const isCovering = coverage?.isCovering ?? false
    const coveringName = coverage?.covering?.repId
      ? representativeById.get(coverage.covering.repId)?.name
      : undefined

    return {
      id: representative.id,
      name: representative.name,
      isOperationallyAbsent,
      isAbsent,
      isUnassigned,
      isCovered,
      coveredByName:
        isCovered && resolution?.kind === 'RESOLVED'
          ? resolution.displayContext.targetName
          : undefined,
      isCovering,
      coveringName,
    }
  })
}
