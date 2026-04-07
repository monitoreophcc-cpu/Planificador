import { addDays, format, parseISO } from 'date-fns'
import { SignedWeeklySnapshot } from '@/domain/audit/SignedWeeklySnapshot'
import { DayInfo } from '@/domain/calendar/types'

export function sortSnapshotsByRecency(
  snapshots: SignedWeeklySnapshot[]
): SignedWeeklySnapshot[] {
  return [...snapshots].sort((a, b) => {
    const weekDiff = b.snapshot.weekStart.localeCompare(a.snapshot.weekStart)
    if (weekDiff !== 0) return weekDiff

    return b.snapshot.createdAt.localeCompare(a.snapshot.createdAt)
  })
}

export function buildSnapshotWeekDays(
  weekStart: string,
  allCalendarDaysForRelevantMonths: DayInfo[]
): DayInfo[] | null {
  const start = parseISO(weekStart)
  const days: DayInfo[] = []

  for (let index = 0; index < 7; index += 1) {
    const date = format(addDays(start, index), 'yyyy-MM-dd')
    const found = allCalendarDaysForRelevantMonths.find(day => day.date === date)

    if (!found) {
      return null
    }

    days.push(found)
  }

  return days
}
