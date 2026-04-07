import type { Incident } from '@/domain/types'
import { incidentLabel, repName } from '@/application/presenters/humanizeStore'
import type { AppState } from './useAppStore'

type IncidentSliceGet = () => Pick<
  AppState,
  'incidents' | 'representatives' | 'pushUndo' | 'addHistoryEvent' | 'addAuditEvent'
>

type IncidentSliceSet = (recipe: (state: AppState) => void) => void

export function removeSingleIncident(
  get: IncidentSliceGet,
  set: IncidentSliceSet,
  id: string,
  silent = false
) {
  const { incidents, representatives, addHistoryEvent, addAuditEvent } = get()
  const incidentToRemove = incidents.find(incident => incident.id === id)

  if (!incidentToRemove) {
    return
  }

  if (!silent) {
    const representativeName = repName(
      representatives,
      incidentToRemove.representativeId
    )

    addHistoryEvent({
      category: 'INCIDENT',
      title: `Incidencia eliminada: ${incidentLabel(incidentToRemove.type)}`,
      subject: representativeName,
      metadata: { incident: incidentToRemove },
    })
    addAuditEvent({
      type: 'INCIDENT_REMOVED',
      actor: 'SYSTEM',
      payload: {
        entity: { type: 'INCIDENT', id: incidentToRemove.id },
        incidentType: incidentToRemove.type,
        date: incidentToRemove.startDate,
        representativeId: incidentToRemove.representativeId,
        reason: 'Manual deletion',
      },
    })
  }

  set(state => {
    state.incidents = state.incidents.filter(incident => incident.id !== id)
  })
}

export function removeBulkIncidents(
  get: IncidentSliceGet,
  set: IncidentSliceSet,
  ids: string[]
) {
  const {
    incidents,
    representatives,
    pushUndo,
    addHistoryEvent,
    addAuditEvent,
  } = get()
  const incidentsToRemove = incidents.filter(incident =>
    ids.includes(incident.id)
  )

  if (incidentsToRemove.length === 0) {
    return
  }

  const representativeName = repName(
    representatives,
    incidentsToRemove[0].representativeId
  )

  addHistoryEvent({
    category: 'INCIDENT',
    title: `${incidentsToRemove.length} incidencia(s) eliminada(s)`,
    subject: representativeName,
    description: `Tipo: ${incidentLabel(incidentsToRemove[0].type)}`,
    metadata: { incidents: incidentsToRemove },
  })

  incidentsToRemove.forEach(incident => {
    if (incident.type === 'OVERRIDE') {
      return
    }

    addAuditEvent({
      type: 'INCIDENT_REMOVED',
      actor: 'SYSTEM',
      payload: {
        entity: { type: 'INCIDENT', id: incident.id },
        incidentType: incident.type,
        reason: 'Bulk deletion',
      },
    })
  })

  set(state => {
    state.incidents = state.incidents.filter(
      incident => !ids.includes(incident.id)
    )
  })

  pushUndo({
    label: `Restauradas ${incidentsToRemove.length} incidencias de ${representativeName}`,
    undo: () => {
      addHistoryEvent({
        category: 'SYSTEM',
        title: 'Incidencias restauradas por "Deshacer"',
        subject: representativeName,
        metadata: { incidents: incidentsToRemove },
      })

      set(state => {
        state.incidents.push(...incidentsToRemove)
      })
    },
  })
}

export function updateIncidentRecord(
  set: IncidentSliceSet,
  id: string,
  updates: Partial<Pick<Incident, 'note' | 'customPoints'>>
) {
  set(state => {
    const index = state.incidents.findIndex(incident => incident.id === id)

    if (index !== -1) {
      state.incidents[index] = { ...state.incidents[index], ...updates }
    }
  })
}
