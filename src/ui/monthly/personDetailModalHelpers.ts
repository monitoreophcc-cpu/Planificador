'use client'

import { format } from 'date-fns'
import type { MonthlySummary } from '@/domain/analytics/types'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import type { DayInfo } from '@/domain/calendar/types'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import type { Representative } from '@/domain/types'
import type {
  CalendarDay,
  DayVisualType,
} from '../components/CalendarGrid'

export function getDisplayedEvents(args: {
  allCalendarDays: DayInfo[]
  currentPersonSummary: MonthlySummary['byPerson'][number] | null
  currentRepresentative: Representative | undefined
  selectedDate: Date | null
}) {
  const {
    allCalendarDays,
    currentPersonSummary,
    currentRepresentative,
    selectedDate,
  } = args

  if (!currentPersonSummary?.incidents || !currentRepresentative) return []
  if (!selectedDate) return currentPersonSummary.incidents

  const dateKey = format(selectedDate, 'yyyy-MM-dd')

  return currentPersonSummary.incidents
    .filter(incident => {
      if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') {
        const resolved = resolveIncidentDates(
          incident,
          allCalendarDays,
          currentRepresentative
        )
        return resolved.dates.includes(dateKey)
      }

      return incident.startDate === dateKey
    })
    .sort((first, second) => first.startDate.localeCompare(second.startDate))
}

export function buildPersonCalendarDays(args: {
  allCalendarDays: DayInfo[]
  currentPersonSummary: MonthlySummary['byPerson'][number] | null
  currentRepresentative: Representative | undefined
  month: string
}): CalendarDay[] {
  const { allCalendarDays, currentPersonSummary, currentRepresentative, month } = args

  if (!currentPersonSummary || !currentRepresentative) return []

  const daysWithIncidents = new Map<
    string,
    { points: number; isOffDay: boolean; visualTypes: DayVisualType[] }
  >()

  const year = parseInt(month.split('-')[0])
  const monthIndex = parseInt(month.split('-')[1]) - 1
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day)
    const dayOfWeek = date.getDay()
    const isOffDay = currentRepresentative.baseSchedule[dayOfWeek] === 'OFF'
    const dateStr = format(date, 'yyyy-MM-dd')
    daysWithIncidents.set(dateStr, { points: 0, isOffDay, visualTypes: [] })
  }

  for (const incident of currentPersonSummary.incidents) {
    if (!incident.startDate) continue

    if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') {
      const resolved = resolveIncidentDates(
        incident,
        allCalendarDays,
        currentRepresentative
      )
      const visualType = incident.type === 'VACACIONES' ? 'VACATION' : 'LICENSE'

      for (const dateStr of resolved.dates) {
        const existing = daysWithIncidents.get(dateStr)
        if (!existing) continue

        existing.points += calculatePoints(incident)
        existing.visualTypes.push(visualType)
      }

      continue
    }

    const existing = daysWithIncidents.get(incident.startDate)
    if (!existing) continue

    existing.points += calculatePoints(incident)

    if (incident.type === 'AUSENCIA') {
      existing.visualTypes.push('ABSENT')
    }
  }

  return Array.from(daysWithIncidents.entries()).map(([dateStr, data]) => {
    let state: CalendarDay['state'] = 'normal'

    if (data.isOffDay && data.points === 0) {
      state = 'disabled'
    } else if (data.points >= 6) {
      state = 'danger'
    } else if (data.points > 0) {
      state = 'warning'
    }

    return {
      date: parseLocalDate(dateStr),
      state,
      visualType: resolveDayVisual(data.visualTypes),
    }
  })
}

function resolveDayVisual(types: DayVisualType[]): DayVisualType {
  if (types.includes('ABSENT')) return 'ABSENT'
  if (types.includes('VACATION')) return 'VACATION'
  if (types.includes('LICENSE')) return 'LICENSE'
  if (types.includes('HOLIDAY')) return 'HOLIDAY'
  if (types.includes('SHIFT_CHANGE')) return 'SHIFT_CHANGE'
  return 'NORMAL'
}
