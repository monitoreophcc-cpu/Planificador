import type { Incident, Representative } from '@/domain/types'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { AnalysisPeriod, PeriodMetrics } from '@/domain/analysis/analysisTypes'

export function summarizePeriod(
  period: AnalysisPeriod,
  incidents: Incident[]
): PeriodMetrics {
  const filteredIncidents = incidents.filter(
    incident => incident.startDate >= period.from && incident.startDate <= period.to
  )

  let incidentsCount = 0
  let points = 0
  let absences = 0
  let licenses = 0

  filteredIncidents.forEach(incident => {
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

export function deltaMetrics(
  base: PeriodMetrics,
  compared: PeriodMetrics
): PeriodMetrics {
  return {
    incidents: base.incidents - compared.incidents,
    points: base.points - compared.points,
    absences: base.absences - compared.absences,
    licenses: base.licenses - compared.licenses,
  }
}

export function summarizeByShift(
  period: AnalysisPeriod,
  incidents: Incident[],
  representatives: Representative[],
  shift: 'DAY' | 'NIGHT'
): PeriodMetrics {
  const representativeIds = new Set(
    representatives
      .filter(
        representative =>
          representative.baseShift === shift && representative.isActive !== false
      )
      .map(representative => representative.id)
  )

  const filteredIncidents = incidents.filter(
    incident =>
      incident.startDate >= period.from &&
      incident.startDate <= period.to &&
      representativeIds.has(incident.representativeId)
  )

  let incidentsCount = 0
  let points = 0
  let absences = 0
  let licenses = 0

  filteredIncidents.forEach(incident => {
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
