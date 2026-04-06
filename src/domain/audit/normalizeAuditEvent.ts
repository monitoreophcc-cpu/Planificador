import type { AuditEvent, AuditEventInput, AuditEventType } from './types'

const knownAuditEventTypes: AuditEventType[] = [
  'COVERAGE_CREATED',
  'COVERAGE_CANCELLED',
  'INCIDENT_CREATED',
  'INCIDENT_REMOVED',
  'SWAP_APPLIED',
  'OVERRIDE_APPLIED',
  'SNAPSHOT_CREATED',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuditEventType(value: unknown): value is AuditEventType {
  return typeof value === 'string' && knownAuditEventTypes.includes(value as AuditEventType)
}

function normalizeActor(value: unknown): AuditEvent['actor'] {
  if (value === 'SYSTEM' || value === 'USER') return value

  if (isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string') {
    return { id: value.id, name: value.name }
  }

  return 'SYSTEM'
}

function normalizeTarget(value: unknown): AuditEvent['target'] | null {
  if (!isRecord(value) || typeof value.entity !== 'string' || !value.entity) {
    return null
  }

  return {
    entity: value.entity,
    entityId: typeof value.entityId === 'string' ? value.entityId : undefined,
  }
}

function resolveTargetFromPayload(payload: unknown): AuditEvent['target'] {
  if (isRecord(payload) && isRecord(payload.entity) && typeof payload.entity.type === 'string') {
    return {
      entity: payload.entity.type,
      entityId: typeof payload.entity.id === 'string' ? payload.entity.id : undefined,
    }
  }

  return { entity: 'UNKNOWN' }
}

function createAuditId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.()
  const fallback = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  return `audit-${randomUuid ?? fallback}`
}

export function buildAuditEvent(
  event: AuditEventInput,
  options?: { id?: string; timestamp?: string }
): AuditEvent {
  const normalizedType = isAuditEventType(event.type) ? event.type : undefined
  const normalizedChange =
    isRecord(event.change) && typeof event.change.field === 'string'
      ? {
          field: event.change.field,
          from: event.change.from,
          to: event.change.to,
        }
      : undefined
  const normalizedContext = isRecord(event.context) ? event.context : undefined

  return {
    id: options?.id ?? createAuditId(),
    timestamp: options?.timestamp ?? new Date().toISOString(),
    actor: normalizeActor(event.actor),
    action:
      typeof event.action === 'string' && event.action
        ? event.action
        : normalizedType ?? 'UNKNOWN_ACTION',
    target: normalizeTarget(event.target) ?? resolveTargetFromPayload(event.payload),
    ...(normalizedChange ? { change: normalizedChange } : {}),
    ...(normalizedContext ? { context: normalizedContext } : {}),
    ...(event.payload !== undefined ? { payload: event.payload } : {}),
    ...(normalizedType ? { type: normalizedType } : {}),
    ...(typeof event.repId === 'string' ? { repId: event.repId } : {}),
  }
}

export function normalizeStoredAuditEvent(event: unknown): AuditEvent | null {
  if (!isRecord(event)) return null

  return buildAuditEvent(
    {
      actor: normalizeActor(event.actor),
      action: typeof event.action === 'string' ? event.action : undefined,
      target: normalizeTarget(event.target) ?? undefined,
      change: isRecord(event.change) && typeof event.change.field === 'string'
        ? {
            field: event.change.field,
            from: event.change.from,
            to: event.change.to,
          }
        : undefined,
      context: isRecord(event.context) ? event.context : undefined,
      payload: event.payload,
      type: isAuditEventType(event.type) ? event.type : undefined,
      repId: typeof event.repId === 'string' ? event.repId : undefined,
    },
    {
      id: typeof event.id === 'string' && event.id ? event.id : undefined,
      timestamp:
        typeof event.timestamp === 'string' && event.timestamp
          ? event.timestamp
          : undefined,
    }
  )
}

export function normalizeAuditLog(events: unknown): AuditEvent[] {
  if (!Array.isArray(events)) return []

  return events
    .map(normalizeStoredAuditEvent)
    .filter((event): event is AuditEvent => event !== null)
}
