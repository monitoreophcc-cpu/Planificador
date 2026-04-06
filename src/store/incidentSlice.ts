import React from 'react'
import type { StateCreator } from 'zustand'
import type { Incident, IncidentInput } from '@/domain/types'
import { incidentLabel, repName } from '@/application/presenters/humanizeStore'
import type { VacationConfirmationPayload } from './useAppUiStore'
import { useAppUiStore } from './useAppUiStore'
import type { AppState } from './useAppStore'

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

    const representative = representatives.find(
      rep => rep.id === incidentData.representativeId
    )

    if (!representative) {
      return { ok: false, reason: 'Representante no encontrado.' }
    }

    const newIncident: Incident = {
      id: `incident-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...incidentData,
    }

    if (newIncident.type === 'AUSENCIA') {
      if (newIncident.source === 'COVERAGE' && !newIncident.slotOwnerId) {
        throw new Error(
          '🔒 INVARIANT VIOLATION: Coverage absence must include slotOwnerId'
        )
      }

      if (
        newIncident.source === 'COVERAGE' &&
        newIncident.slotOwnerId &&
        newIncident.representativeId === newIncident.slotOwnerId
      ) {
        throw new Error(
          '🔒 INVARIANT VIOLATION: Absence cannot be assigned to slot owner when coverage existed. ' +
            'The absence must be assigned to the covering representative.'
        )
      }

      if (newIncident.source === 'SWAP' && !newIncident.slotOwnerId) {
        throw new Error(
          '🔒 INVARIANT VIOLATION: Swap absence must include slotOwnerId'
        )
      }
    }

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
      if (validation.warning) {
        confirmed = await showConfirm({
          title: 'Confirmar Acción',
          description: validation.warning,
          intent: 'warning',
          confirmLabel: 'Continuar',
        })
      } else {
        const isOverride = newIncident.type === 'OVERRIDE'
        const representativeName = repName(
          representatives,
          newIncident.representativeId
        )
        const label = incidentLabel(newIncident.type)

        confirmed = await showConfirm({
          title: isOverride
            ? 'Confirmar Cambio de Turno'
            : 'Confirmar Incidencia',
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
        })
      }

      if (!confirmed) {
        return { ok: false, reason: 'Acción cancelada por el usuario.' }
      }
    }

    const { addHistoryEvent, addAuditEvent } = get()

    addHistoryEvent({
      category: 'INCIDENT',
      title: `${incidentLabel(newIncident.type)} registrada${
        newIncident.source === 'COVERAGE' ? ' (Cobertura)' : ''
      }`,
      subject: representative.name,
      impact:
        newIncident.type !== 'OVERRIDE' &&
        newIncident.type !== 'VACACIONES' &&
        newIncident.type !== 'LICENCIA'
          ? `-${calculatePoints(newIncident)} pts`
          : undefined,
      description:
        newIncident.note ||
        (newIncident.source === 'COVERAGE'
          ? `Fallo de cobertura para ${newIncident.slotOwnerId}`
          : undefined),
    })
    addAuditEvent({
      type: 'INCIDENT_CREATED',
      actor: 'SYSTEM',
      payload: {
        entity: { type: 'INCIDENT', id: newIncident.id },
        incidentType: newIncident.type,
        date: newIncident.startDate,
        representativeId: newIncident.representativeId,
        note: newIncident.note,
        source: newIncident.source,
        slotOwnerId: newIncident.slotOwnerId,
      },
    })

    const newDisciplinaryKey = buildDisciplinaryKey(newIncident)
    const incidentWithKey = {
      ...newIncident,
      disciplinaryKey: newDisciplinaryKey,
    }

    let vacationConfirmation: VacationConfirmationPayload | null = null

    set(state => {
      if (incidentWithKey.type === 'AUSENCIA') {
        const removedIncidents = state.incidents.filter(
          incident =>
            incident.representativeId ===
              incidentWithKey.representativeId &&
            incident.startDate === incidentWithKey.startDate &&
            incident.disciplinaryKey === newDisciplinaryKey
        )

        if (removedIncidents.length > 0) {
          addHistoryEvent({
            category: 'SYSTEM',
            title: 'Incidencia actualizada',
            subject: representative.name,
            description: `Se reemplazó un evento previo (${newDisciplinaryKey}).`,
          })
        }

        state.incidents = state.incidents.filter(
          incident =>
            !(
              incident.representativeId ===
                incidentWithKey.representativeId &&
              incident.startDate === incidentWithKey.startDate &&
              incident.disciplinaryKey === newDisciplinaryKey
            )
        )
      }

      if (
        !state.incidents.some(existingIncident => existingIncident.id === incidentWithKey.id)
      ) {
        state.incidents.push(incidentWithKey)
      }

      if (newIncident.type === 'VACACIONES') {
        const resolvedDates = resolveIncidentDates(
          newIncident,
          allCalendarDaysForRelevantMonths,
          representative
        )

        if (resolvedDates.dates.length > 0) {
          vacationConfirmation = {
            repName: representative.name,
            startDate: resolvedDates.start || newIncident.startDate,
            endDate: resolvedDates.end || newIncident.startDate,
            returnDate: resolvedDates.returnDate || newIncident.startDate,
            workingDays: resolvedDates.dates.length,
          }
        }
      }
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
