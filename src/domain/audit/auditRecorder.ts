/**
 * ⚠️ HARDENED MODULE - AUDIT RECORDER
 * ------------------------------------
 * This is the single, hardened entry point for writing audit events.
 *
 * Rules:
 * - Audit events are NEVER derived or modified after creation.
 * - ID and timestamp are ALWAYS generated here.
 * - This function is pure regarding its inputs, with the controlled
 *   side effect of mutating the Immer draft state.
 *
 * Any write to `auditLog` outside this function is a critical violation.
 */

import type { Draft } from 'immer'
import type { PlanningBaseState } from '../types'
import type { AuditEventInput } from './types'
import { buildAuditEvent } from './normalizeAuditEvent'

export function recordAuditEvent(
  state: Draft<PlanningBaseState>,
  event: AuditEventInput
): void {
  const auditEvent = buildAuditEvent(event)

  // Prepend to keep newest-first ordering, which is efficient for logs.
  state.auditLog.unshift(auditEvent)
}
