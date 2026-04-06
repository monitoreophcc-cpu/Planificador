'use client'

import { addDays, format, startOfWeek } from 'date-fns'
import { buildWeeklySchedule } from '@/domain/planning/buildWeeklySchedule'
import type {
  DayInfo,
  Incident,
  Representative,
  SpecialSchedule,
  WeeklyPlan,
} from '@/domain/types'

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
