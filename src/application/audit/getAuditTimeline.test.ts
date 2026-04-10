import { mapAuditEventsToTimeline } from './getAuditTimeline'
import type { AuditEvent } from '@/domain/audit/types'

describe('mapAuditEventsToTimeline', () => {
  it('humanizes override incidents in the forensic timeline', () => {
    const events: AuditEvent[] = [
      {
        id: 'audit-1',
        timestamp: '2026-04-10T12:00:00.000Z',
        actor: { id: 'user-1', name: 'Junior' },
        action: 'INCIDENT_CREATED',
        target: { entity: 'INCIDENT', entityId: 'inc-1' },
        payload: {
          incidentType: 'OVERRIDE',
          note: 'Cambio puntual',
        },
        type: 'INCIDENT_CREATED',
      },
    ]

    const [item] = mapAuditEventsToTimeline(events)

    expect(item.summary).toBe('Incidencia: Cambio de turno')
    expect(item.details).toBe('Cambio puntual')
  })

  it('uses a human label for override audit events', () => {
    const events: AuditEvent[] = [
      {
        id: 'audit-2',
        timestamp: '2026-04-10T13:00:00.000Z',
        actor: 'SYSTEM',
        action: 'OVERRIDE_APPLIED',
        target: { entity: 'SHIFT', entityId: 'rep-1' },
        type: 'OVERRIDE_APPLIED',
      },
    ]

    const [item] = mapAuditEventsToTimeline(events)

    expect(item.summary).toBe('Cambio de turno aplicado')
  })
})
