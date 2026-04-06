import {
  normalizeAuditLog,
  normalizeStoredAuditEvent,
} from './normalizeAuditEvent'

describe('normalizeAuditEvent legacy migration', () => {
  it('derives action and target from legacy payload while preserving id and timestamp', () => {
    const [event] = normalizeAuditLog([
      {
        id: 'audit-legacy-1',
        timestamp: '2026-04-05T12:00:00.000Z',
        actor: 'SYSTEM',
        type: 'INCIDENT_CREATED',
        payload: {
          entity: { type: 'INCIDENT', id: 'incident-123' },
          incidentType: 'AUSENCIA',
        },
      },
    ])

    expect(event).toEqual({
      id: 'audit-legacy-1',
      timestamp: '2026-04-05T12:00:00.000Z',
      actor: 'SYSTEM',
      action: 'INCIDENT_CREATED',
      target: { entity: 'INCIDENT', entityId: 'incident-123' },
      change: undefined,
      context: undefined,
      payload: {
        entity: { type: 'INCIDENT', id: 'incident-123' },
        incidentType: 'AUSENCIA',
      },
      type: 'INCIDENT_CREATED',
      repId: undefined,
    })
  })

  it('respects explicit action and target when they already exist', () => {
    const event = normalizeStoredAuditEvent({
      id: 'audit-explicit-1',
      timestamp: '2026-04-05T13:00:00.000Z',
      actor: { id: 'user-1', name: 'Admin' },
      type: 'SNAPSHOT_CREATED',
      action: 'SNAPSHOT_SEALED',
      target: { entity: 'SNAPSHOT', entityId: 'snap-9' },
      payload: {
        entity: { type: 'INCIDENT', id: 'should-not-win' },
      },
    })

    expect(event).toMatchObject({
      id: 'audit-explicit-1',
      timestamp: '2026-04-05T13:00:00.000Z',
      actor: { id: 'user-1', name: 'Admin' },
      action: 'SNAPSHOT_SEALED',
      target: { entity: 'SNAPSHOT', entityId: 'snap-9' },
      type: 'SNAPSHOT_CREATED',
    })
  })

  it('filters invalid entries and falls back to safe defaults for malformed legacy events', () => {
    const normalized = normalizeAuditLog([
      null,
      'broken',
      123,
      {
        id: 'audit-bad-1',
        timestamp: '2026-04-05T14:00:00.000Z',
        actor: { bad: true },
        type: 'NOT_REAL',
        payload: { foo: 'bar' },
        change: { nope: true },
        context: 'invalid',
      },
    ])

    expect(normalized).toHaveLength(1)
    expect(normalized[0]).toEqual({
      id: 'audit-bad-1',
      timestamp: '2026-04-05T14:00:00.000Z',
      actor: 'SYSTEM',
      action: 'UNKNOWN_ACTION',
      target: { entity: 'UNKNOWN' },
      change: undefined,
      context: undefined,
      payload: { foo: 'bar' },
      type: undefined,
      repId: undefined,
    })
  })
})
