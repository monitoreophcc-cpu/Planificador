import type { Incident, IncidentInput } from '@/domain/types'

type IncidentRuntime = {
  validateIncident: typeof import('@/domain/incidents/validateIncident').validateIncident
  resolveIncidentDates: typeof import('@/domain/incidents/resolveIncidentDates').resolveIncidentDates
  buildDisciplinaryKey: typeof import('@/domain/incidents/buildDisciplinaryKey').buildDisciplinaryKey
  calculatePoints: typeof import('@/domain/analytics/computeMonthlySummary').calculatePoints
}

export async function loadIncidentRuntime(): Promise<IncidentRuntime> {
  const [
    { validateIncident },
    { resolveIncidentDates },
    { buildDisciplinaryKey },
    { calculatePoints },
  ] = await Promise.all([
    import('@/domain/incidents/validateIncident'),
    import('@/domain/incidents/resolveIncidentDates'),
    import('@/domain/incidents/buildDisciplinaryKey'),
    import('@/domain/analytics/computeMonthlySummary'),
  ])

  return {
    validateIncident,
    resolveIncidentDates,
    buildDisciplinaryKey,
    calculatePoints,
  }
}

export function createIncidentRecord(incidentData: IncidentInput): Incident {
  return {
    id: `incident-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...incidentData,
  }
}

export function assertIncidentInvariants(incident: Incident): void {
  if (incident.type !== 'AUSENCIA') return

  if (incident.source === 'COVERAGE' && !incident.slotOwnerId) {
    throw new Error(
      '🔒 INVARIANT VIOLATION: Coverage absence must include slotOwnerId'
    )
  }

  if (
    incident.source === 'COVERAGE' &&
    incident.slotOwnerId &&
    incident.representativeId === incident.slotOwnerId
  ) {
    throw new Error(
      '🔒 INVARIANT VIOLATION: Absence cannot be assigned to slot owner when coverage existed. ' +
        'The absence must be assigned to the covering representative.'
    )
  }

  if (incident.source === 'SWAP' && !incident.slotOwnerId) {
    throw new Error('🔒 INVARIANT VIOLATION: Swap absence must include slotOwnerId')
  }
}

export type { IncidentRuntime }
