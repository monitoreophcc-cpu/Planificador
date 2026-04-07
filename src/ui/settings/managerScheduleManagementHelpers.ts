import { addDays, format, parseISO } from 'date-fns'

export function getTodayIsoDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function buildNextWeekDates(currentWeekDates: string[]) {
  return currentWeekDates.map(date => {
    const parsedDate = parseISO(date)
    return format(addDays(parsedDate, 7), 'yyyy-MM-dd')
  })
}
