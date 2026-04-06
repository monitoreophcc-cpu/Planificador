import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { IncidentType } from '@/domain/types'
import type { EnrichedIncident } from './logHelpers'

export interface PersonInGroup {
  repName: string
  count: number
  incidents: EnrichedIncident[]
}

export interface GroupedByType {
  type: IncidentType
  totalCount: number
  people: PersonInGroup[]
  items?: EnrichedIncident[]
  totalPoints: number
}

const INCIDENT_TYPE_ORDER: Record<IncidentType, number> = {
  AUSENCIA: 1,
  TARDANZA: 2,
  ERROR: 3,
  OTRO: 4,
  VACACIONES: 5,
  LICENCIA: 6,
  OVERRIDE: 7,
  SWAP: 8,
}

export function groupDailyEvents(incidents: EnrichedIncident[]) {
  const orderedIncidents = [...incidents].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  )

  const punctualIncidents = orderedIncidents.filter(
    incident => incident.type !== 'LICENCIA' && incident.type !== 'VACACIONES'
  )
  const rangeIncidents = orderedIncidents.filter(
    incident => incident.type === 'LICENCIA' || incident.type === 'VACACIONES'
  )

  const incidentsByType = new Map<IncidentType, EnrichedIncident[]>()

  for (const incident of punctualIncidents) {
    if (!incidentsByType.has(incident.type)) {
      incidentsByType.set(incident.type, [])
    }

    incidentsByType.get(incident.type)!.push(incident)
  }

  const punctualGroups: GroupedByType[] = []

  for (const [type, typedIncidents] of incidentsByType.entries()) {
    if (type === 'OTRO') {
      punctualGroups.push({
        type,
        totalCount: typedIncidents.length,
        items: typedIncidents,
        totalPoints: typedIncidents.reduce(
          (sum, incident) => sum + calculatePoints(incident),
          0
        ),
        people: [],
      })
      continue
    }

    const peopleMap = new Map<string, PersonInGroup>()

    for (const incident of typedIncidents) {
      if (!peopleMap.has(incident.repName)) {
        peopleMap.set(incident.repName, {
          repName: incident.repName,
          count: 0,
          incidents: [],
        })
      }

      const personGroup = peopleMap.get(incident.repName)!
      personGroup.count += 1
      personGroup.incidents.push(incident)
    }

    punctualGroups.push({
      type,
      totalCount: typedIncidents.length,
      people: Array.from(peopleMap.values()),
      totalPoints: typedIncidents.reduce(
        (sum, incident) => sum + calculatePoints(incident),
        0
      ),
    })
  }

  punctualGroups.sort((left, right) => {
    return (
      (INCIDENT_TYPE_ORDER[left.type] || 99) -
      (INCIDENT_TYPE_ORDER[right.type] || 99)
    )
  })

  return {
    punctualGroups,
    rangeIncidents,
  }
}
