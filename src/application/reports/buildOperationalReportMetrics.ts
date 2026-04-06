import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { Incident } from '@/domain/types'
import type { PeriodMetrics } from '@/domain/reports/operationalTypes'

export function summarizePeriodMetrics(
  incidents: Incident[],
  from: string,
  to: string
): PeriodMetrics {
  const filtered = incidents.filter(
    incident => incident.startDate >= from && incident.startDate <= to
  )

  let incidentsCount = 0
  let points = 0
  let absences = 0
  let licenses = 0

  filtered.forEach(incident => {
    const incidentPoints = calculatePoints(incident)

    if (incidentPoints > 0) {
      incidentsCount++
      points += incidentPoints
    }

    if (incident.type === 'AUSENCIA') absences++
    if (incident.type === 'LICENCIA') licenses++
  })

  return { incidents: incidentsCount, points, absences, licenses }
}

export function calculatePeriodDelta(
  current: PeriodMetrics,
  compared: PeriodMetrics
): PeriodMetrics {
  return {
    incidents: current.incidents - compared.incidents,
    points: current.points - compared.points,
    absences: current.absences - compared.absences,
    licenses: current.licenses - compared.licenses,
  }
}
