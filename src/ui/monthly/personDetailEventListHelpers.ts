'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { IncidentWithPoints } from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'

export function getPersonDetailEventEmptyMessage(selectedDate: Date | null) {
  return selectedDate
    ? 'No se registraron incidencias en este dia.'
    : 'No se registraron incidencias con penalizacion este mes.'
}

export function buildIncidentDisplay(
  incident: IncidentWithPoints,
  allCalendarDays: DayInfo[],
  currentRepresentative: Representative
) {
  if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') {
    const resolved = resolveIncidentDates(
      incident,
      allCalendarDays,
      currentRepresentative
    )

    if (resolved.start && resolved.end && resolved.returnDate) {
      const startFormatted = format(parseLocalDate(resolved.start), "dd 'de' MMMM", {
        locale: es,
      })
      const endFormatted = format(parseLocalDate(resolved.end), "dd 'de' MMMM", {
        locale: es,
      })
      const returnFormatted = format(
        parseLocalDate(resolved.returnDate),
        "dd 'de' MMMM",
        { locale: es }
      )

      return {
        dateLabel: `${
          incident.type === 'VACACIONES' ? 'Vacaciones' : 'Licencia'
        } del ${startFormatted} al ${endFormatted}`,
        workingDaysInfo:
          incident.type === 'VACACIONES'
            ? `${resolved.dates.length} dias laborables • Retorna ${returnFormatted}`
            : `${resolved.dates.length} dias naturales • Retorna ${returnFormatted}`,
      }
    }
  }

  return {
    dateLabel: incident.startDate
      ? format(parseLocalDate(incident.startDate), "EEEE, dd 'de' MMMM", {
          locale: es,
        })
      : 'Fecha no disponible',
    workingDaysInfo: '',
  }
}
