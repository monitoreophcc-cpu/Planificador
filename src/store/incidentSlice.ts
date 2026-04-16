import type { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import type { Incident, IncidentInput } from '@/domain/types'
import type { VacationConfirmationPayload } from './useAppUiStore'
import { useAppUiStore } from './useAppUiStore'
import type { AppState } from './useAppStore'
import { canCurrentUserEditData } from './useAccessStore'
import {
  applyIncidentToState,
  assertIncidentInvariants,
  buildIncidentConfirmOptions,
  createIncidentRecord,
  loadIncidentRuntime,
  recordCreatedIncident,
} from './incidentSliceHelpers'
import {
  removeBulkIncidents,
  removeSingleIncident,
  updateIncidentRecord,
} from './incidentRemoval'

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
    if (!canCurrentUserEditData()) {
      return { ok: false, reason: READ_ONLY_ACTION_MESSAGE }
    }

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
    if (!canCurrentUserEditData()) {
      console.warn('[Access] removeIncident bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    removeSingleIncident(get, set, id, silent)
  },

  removeIncidents: ids => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] removeIncidents bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    removeBulkIncidents(get, set, ids)
  },

  updateIncident: (id, updates) => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] updateIncident bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    updateIncidentRecord(set, id, updates)
  },
})
