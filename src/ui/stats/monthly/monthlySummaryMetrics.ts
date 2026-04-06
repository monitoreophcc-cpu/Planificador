import { format } from 'date-fns'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import type { DayInfo, Incident, Representative } from '@/domain/types'
import type { MonthlySummary } from '@/domain/analytics/types'

export interface MonthlySummaryMetrics {
  onVacation: number
  onLicense: number
  atRisk: number
}

export function filterMonthlySummaryBySearch(
  summary: MonthlySummary | null,
  searchTerm: string
): MonthlySummary | null {
  if (!summary || !searchTerm.trim()) {
    return summary
  }

  const normalizedTerm = searchTerm.toLowerCase()

  return {
    ...summary,
    byPerson: summary.byPerson.filter(person =>
      person.name.toLowerCase().includes(normalizedTerm)
    ),
  }
}

export function computeMonthlySummaryMetrics(
  summary: MonthlySummary | null,
  incidents: Incident[],
  representatives: Representative[],
  allCalendarDaysForRelevantMonths: DayInfo[]
): MonthlySummaryMetrics {
  if (!summary) {
    return { onVacation: 0, onLicense: 0, atRisk: 0 }
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const representativesById = new Map(
    representatives.map(representative => [representative.id, representative])
  )

  return {
    onVacation: countActiveRepresentativesByIncidentType(
      incidents,
      'VACACIONES',
      representativesById,
      allCalendarDaysForRelevantMonths,
      today
    ),
    onLicense: countActiveRepresentativesByIncidentType(
      incidents,
      'LICENCIA',
      representativesById,
      allCalendarDaysForRelevantMonths,
      today
    ),
    atRisk: summary.byPerson.filter(person => person.totals.puntos >= 10).length,
  }
}

function countActiveRepresentativesByIncidentType(
  incidents: Incident[],
  incidentType: 'VACACIONES' | 'LICENCIA',
  representativesById: Map<string, Representative>,
  allCalendarDaysForRelevantMonths: DayInfo[],
  today: string
) {
  const activeRepresentatives = new Set<string>()

  for (const incident of incidents) {
    if (incident.type !== incidentType) {
      continue
    }

    const representative = representativesById.get(incident.representativeId)
    if (!representative) {
      continue
    }

    const resolved = resolveIncidentDates(
      incident,
      allCalendarDaysForRelevantMonths,
      representative
    )

    if (resolved.dates.includes(today)) {
      activeRepresentatives.add(incident.representativeId)
    }
  }

  return activeRepresentatives.size
}
