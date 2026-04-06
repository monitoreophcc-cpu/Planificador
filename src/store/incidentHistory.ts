import React from 'react'
import type { ValidationResult } from '@/domain/incidents/validateIncident'
import type { Incident, Representative } from '@/domain/types'
import { incidentLabel, repName } from '@/application/presenters/humanizeStore'
import type { ConfirmOptions } from './useAppUiStore'
import type { AppState } from './useAppStore'
import type { IncidentRuntime } from './incidentRuntime'

interface BuildIncidentConfirmOptionsArgs {
  incident: Incident
  representatives: Representative[]
  validation: Extract<ValidationResult, { ok: true }>
}

interface RecordCreatedIncidentArgs {
  incident: Incident
  representative: Representative
  representatives: Representative[]
  calculatePoints: IncidentRuntime['calculatePoints']
  addHistoryEvent: AppState['addHistoryEvent']
  addAuditEvent: AppState['addAuditEvent']
}

export function buildIncidentConfirmOptions({
  incident,
  representatives,
  validation,
}: BuildIncidentConfirmOptionsArgs): ConfirmOptions {
  if (validation.warning) {
    return {
      title: 'Confirmar Acción',
      description: validation.warning,
      intent: 'warning',
      confirmLabel: 'Continuar',
    }
  }

  const isOverride = incident.type === 'OVERRIDE'
  const representativeName = repName(representatives, incident.representativeId)
  const label = incidentLabel(incident.type)

  return {
    title: isOverride ? 'Confirmar Cambio de Turno' : 'Confirmar Incidencia',
    description: React.createElement(
      'span',
      null,
      'Registrar ',
      isOverride
        ? 'una modificación manual'
        : React.createElement(
            'strong',
            {
              style: {
                fontWeight: 700,
                color: 'var(--text-main)',
              },
            },
            label
          ),
      ' a ',
      React.createElement(
        'strong',
        {
          style: {
            fontWeight: 700,
            color: 'var(--text-main)',
          },
        },
        representativeName
      ),
      '.'
    ),
    intent: 'info',
    confirmLabel: isOverride ? 'Aplicar Cambio' : 'Registrar',
  }
}

export function recordCreatedIncident({
  incident,
  representative,
  representatives,
  calculatePoints,
  addHistoryEvent,
  addAuditEvent,
}: RecordCreatedIncidentArgs): void {
  addHistoryEvent({
    category: 'INCIDENT',
    title: `${incidentLabel(incident.type)} registrada${
      incident.source === 'COVERAGE' ? ' (Cobertura)' : ''
    }`,
    subject: representative.name,
    impact:
      incident.type !== 'OVERRIDE' &&
      incident.type !== 'VACACIONES' &&
      incident.type !== 'LICENCIA'
        ? `-${calculatePoints(incident)} pts`
        : undefined,
    description:
      incident.note ||
      (incident.source === 'COVERAGE'
        ? `Fallo de cobertura para ${incident.slotOwnerId}`
        : undefined),
  })

  addAuditEvent({
    type: 'INCIDENT_CREATED',
    actor: 'SYSTEM',
    payload: {
      entity: { type: 'INCIDENT', id: incident.id },
      incidentType: incident.type,
      date: incident.startDate,
      representativeId: incident.representativeId,
      note: incident.note,
      source: incident.source,
      slotOwnerId: incident.slotOwnerId,
    },
  })
}
