import type { Incident, Representative } from '@/domain/types'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type {
  AnalysisPeriod,
  RepresentativeRisk,
} from '@/domain/analysis/analysisTypes'

export function computeOperationalRisk(
  period: AnalysisPeriod,
  incidents: Incident[],
  representatives: Representative[]
): {
  needsAttention: RepresentativeRisk[]
  topPerformers: RepresentativeRisk[]
} {
  const byRepresentative = new Map<string, { name: string; points: number }>()

  representatives
    .filter(representative => representative.isActive !== false)
    .forEach(representative => {
      byRepresentative.set(representative.id, {
        name: representative.name,
        points: 0,
      })
    })

  incidents.forEach(incident => {
    if (incident.startDate < period.from || incident.startDate > period.to) return
    const entry = byRepresentative.get(incident.representativeId)
    if (!entry) return
    entry.points += calculatePoints(incident)
  })

  const people = Array.from(byRepresentative.entries()).map(([id, value]) => ({
    id,
    name: value.name,
    points: value.points,
  }))

  return {
    needsAttention: people
      .filter(person => person.points > 0)
      .sort((a, b) => b.points - a.points),
    topPerformers: people
      .filter(person => person.points === 0)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}
