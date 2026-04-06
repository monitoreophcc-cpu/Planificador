import type { ISODate, SpecialDay } from '@/domain/types'

export function buildHoliday(date: string, label: string): SpecialDay {
  return {
    date: date as ISODate,
    kind: 'HOLIDAY',
    label: label.trim(),
  }
}

export function formatHolidayDate(isoDate: string) {
  try {
    const date = new Date(`${isoDate}T12:00:00Z`)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}
