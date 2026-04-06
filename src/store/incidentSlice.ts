import type { StateCreator } from 'zustand'
import type { Incident, IncidentInput } from '@/domain/types'
import { incidentLabel, repName } from '@/application/presenters/humanizeStore'
import type { VacationConfirmationPayload } from './useAppUiStore'
import { useAppUiStore } from './useAppUiStore'
import type { AppState } from './useAppStore'
import {
  applyIncidentToState,
  assertIncidentInvariants,
  buildIncidentConfirmOptions,
  createIncidentRecord,
  loadIncidentRuntime,
  recordCreatedIncident,
} from './incidentSliceHelpers'

export interface IncidentSlice {
  addIncident: (
    data: IncidentInput,
    skipConfirm?: boolean
  ) => Promise<{ ok: true; newId: string } | { ok: false; reason: string }>
  removeIncident: (id: string, silent?: boolean) => void
  removeIncidents: (ids: string[]) => void
  updateIncident: (
    id: string,
    updates: Partial<Pick<Incident, 'note' | 'customPoints'>>
  ) => void
}

export const createIncidentSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  IncidentSlice
> = (set, get) => ({
  addIncident: async (incidentData, skipConfirm = false) => {
    const {
      representatives,
      incidents,
      allCalendarDaysForRelevantMonths,
      showConfirm,
    } = get()
    const {
      validateIncident,
      resolveIncidentDates,
      buildDisciplinaryKey,
      calculatePoints,
    } = await loadIncidentRuntime()

    const representative = representatives.find(
      rep => rep.id === incidentData.representativeId
    )

    if (!representative) {
      return { ok: false, reason: 'Representante no encontrado.' }
    }

    const newIncident: Incident = createIncidentRecord(incidentData)
    assertIncidentInvariants(newIncident)

    const validation = validateIncident(
      newIncident,
      incidents,
      allCalendarDaysForRelevantMonths,
      representative,
      representatives
    )

    if (!validation.ok) {
      return { ok: false, reason: validation.message }
    }

    let confirmed = skipConfirm

    if (!confirmed) {
      confirmed = await showConfirm(
        buildIncidentConfirmOptions({
          incident: newIncident,
          representatives,
          validation,
        })
      )

      if (!confirmed) {
        return { ok: false, reason: 'Acción cancelada por el usuario.' }
      }
    }

    const { addHistoryEvent, addAuditEvent } = get()

    recordCreatedIncident({
      incident: newIncident,
      representative,
      representatives,
      calculatePoints,
      addHistoryEvent,
      addAuditEvent,
    })

    const newDisciplinaryKey = buildDisciplinaryKey(newIncident)

    let vacationConfirmation: VacationConfirmationPayload | null = null

    set(state => {
      vacationConfirmation = applyIncidentToState({
        state,
        incident: newIncident,
        disciplinaryKey: newDisciplinaryKey,
        representative,
        allCalendarDaysForRelevantMonths,
        resolveIncidentDates,
        addHistoryEvent,
      })
    })

    if (vacationConfirmation) {
      useAppUiStore.getState().openVacationConfirmation(vacationConfirmation)
    }

    return { ok: true, newId: newIncident.id }
  },

  removeIncident: (id, silent = false) => {
    const { incidents, representatives, addHistoryEvent, addAuditEvent } = get()
    const incidentToRemove = incidents.find(incident => incident.id === id)

    if (!incidentToRemove) return

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
  },

  removeIncidents: ids => {
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

    if (incidentsToRemove.length === 0) return

    const repId = incidentsToRemove[0].representativeId
    const representativeName = repName(representatives, repId)

    addHistoryEvent({
      category: 'INCIDENT',
      title: `${incidentsToRemove.length} incidencia(s) eliminada(s)`,
      subject: representativeName,
      description: `Tipo: ${incidentLabel(incidentsToRemove[0].type)}`,
      metadata: { incidents: incidentsToRemove },
    })

    incidentsToRemove.forEach(incident => {
      if (incident.type === 'OVERRIDE') return

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
  },

  updateIncident: (id, updates) => {
    set(state => {
      const index = state.incidents.findIndex(incident => incident.id === id)

      if (index !== -1) {
        state.incidents[index] = { ...state.incidents[index], ...updates }
      }
    })
  },
})
