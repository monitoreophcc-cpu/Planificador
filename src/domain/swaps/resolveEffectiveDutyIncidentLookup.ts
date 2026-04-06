import { resolveIncidentDates } from '../incidents/resolveIncidentDates'
import type { DayInfo } from '../calendar/types'
import type { Incident, ISODate, Representative } from '../types'

function findResolvedIncidentByType(args: {
  allCalendarDays: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
  representativeId: string
  incidentType: Incident['type']
}): Incident | undefined {
  const {
    allCalendarDays,
    date,
    incidents,
    representative,
    representativeId,
    incidentType,
  } = args

  return incidents.find(incident => {
    if (incident.representativeId !== representativeId) return false
    if (incident.type !== incidentType) return false

    const resolved = resolveIncidentDates(
      incident,
      allCalendarDays,
      representative
    )

    return resolved.dates.includes(date)
  })
}

export function findBlockingFormalIncidentByLookup(args: {
  allCalendarDays: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
  representativeId: string
}): Incident | undefined {
  const { allCalendarDays, date, incidents, representative, representativeId } =
    args

  return incidents.find(incident => {
    if (incident.representativeId !== representativeId) return false
    if (!['VACACIONES', 'LICENCIA'].includes(incident.type)) return false

    const resolved = resolveIncidentDates(
      incident,
      allCalendarDays,
      representative
    )

    if (resolved.dates.includes(date)) return true

    if (incident.type === 'VACACIONES' && resolved.start && resolved.returnDate) {
      return date >= resolved.start && date < resolved.returnDate
    }

    return false
  })
}

export function findAbsenceIncidentByLookup(args: {
  allCalendarDays: DayInfo[]
  date: ISODate
  incidents: Incident[]
  representative: Representative
  representativeId: string
}): Incident | undefined {
  return findResolvedIncidentByType({
    ...args,
    incidentType: 'AUSENCIA',
  })
}
