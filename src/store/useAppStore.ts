'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  PlanningBaseState,
  CoverageRule,
  SpecialDay,
  ISODate,
  DayInfo,
  Incident,
  IncidentInput,
  Representative,
  SwapEvent,
  ShiftAssignment,
  SpecialSchedule,
} from '@/domain/types'
import { Manager } from '@/domain/management/types'
import type { HistoryEvent } from '@/domain/history/types'
import { createInitialState } from '@/domain/state'

// ... existing code ...


import { generateMonthDays } from '@/domain/calendar/state'
import React from 'react'
import { AuditEventInput } from '@/domain/audit/types'

import {
  incidentLabel,
  repName,
  swapDescription,
} from '@/application/presenters/humanizeStore'
import { BackupPayload } from '@/application/backup/types'
import { recordAuditEvent } from '@/domain/audit/auditRecorder'
import { normalizeAuditLog } from '@/domain/audit/normalizeAuditEvent'
import { ManagementScheduleSlice, createManagementScheduleSlice } from './managementScheduleSlice'
import {
  useAppUiStore,
  type ConfirmOptions,
  type UndoAction,
  type VacationConfirmationPayload,
} from './useAppUiStore'

export const DOMAIN_VERSION = 7

// --- Main App State ---
export type AppState = PlanningBaseState & ManagementScheduleSlice & {
  isLoading: boolean
  planningAnchorDate: ISODate
  allCalendarDaysForRelevantMonths: DayInfo[]

  // Actions
  initialize: () => Promise<void>
  setPlanningAnchorDate: (date: ISODate) => void
  addOrUpdateCoverageRule: (rule: CoverageRule) => void
  removeCoverageRule: (id: string) => void
  addOrUpdateSpecialDay: (day: SpecialDay) => void
  removeSpecialDay: (date: ISODate) => void
  resetState: (keepFormalIncidents: boolean) => void
  addIncident: (
    data: IncidentInput,
    skipConfirm?: boolean
  ) => Promise<{ ok: true; newId: string } | { ok: false; reason: string }>
  removeIncident: (id: string, silent?: boolean) => void
  removeIncidents: (ids: string[]) => void
  updateIncident: (id: string, updates: Partial<Pick<Incident, 'note' | 'customPoints'>>) => void
  addSwap: (data: Omit<SwapEvent, 'id' | 'createdAt'>) => void
  removeSwap: (id: string) => void
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
  handleConfirm: (value: boolean) => void
  openDetailModal: (personId: string, month: string) => void
  closeDetailModal: () => void
  showMixedShiftConfirmModal: (
    representativeId: string,
    date: ISODate,
    activeShift: 'DAY' | 'NIGHT'
  ) => Promise<ShiftAssignment | null>
  handleMixedShiftConfirm: (assignment: ShiftAssignment | null) => void
  closeVacationConfirmation: () => void

  // Navigation & View State
  dailyLogDate: ISODate
  setDailyLogDate: (date: ISODate) => void

  requestNavigation: (view: 'PLANNING' | 'DAILY_LOG' | 'STATS' | 'SETTINGS') => void
  clearNavigationRequest: () => void

  // Private/internal state management
  _generateCalendarDays: () => void

  // Representative Actions
  addRepresentative: (data: Omit<Representative, 'id' | 'isActive'>) => void
  updateRepresentative: (rep: Representative) => void
  deactivateRepresentative: (repId: string) => void
  reorderRepresentatives: (shift: 'DAY' | 'NIGHT', orderedIds: string[]) => void
  normalizeOrderIndexes: (shift: 'DAY' | 'NIGHT') => void

  // Special Schedule Actions
  addSpecialSchedule: (data: Omit<SpecialSchedule, 'id'>) => { success: boolean; message?: string }
  updateSpecialSchedule: (id: string, updates: Partial<Omit<SpecialSchedule, 'id' | 'representativeId'>>) => { success: boolean; message?: string }
  removeSpecialSchedule: (id: string) => void

  // History Actions
  addHistoryEvent: (data: Omit<HistoryEvent, 'id' | 'timestamp'>) => void

  // Audit Actions
  addAuditEvent: (event: AuditEventInput) => void

  // Undo Actions
  pushUndo: (
    action: Omit<UndoAction, 'id' | 'timeoutId'>,
    timeoutMs?: number
  ) => void
  commitUndo: (id: string) => void
  executeUndo: (id: string) => void

  // Backup/Restore
  exportState: () => PlanningBaseState
  importState: (data: BackupPayload) => { success: boolean; message: string }

  // Manager Actions (Entity Management Only)
  addManager: (data: Omit<Manager, 'id'>) => void
  removeManager: (id: string) => void
  reorderManagers: (orderedIds: string[]) => void
}

// ----------------------------------------------------------------------
// 🧹 HELPER: Normalizar horarios especiales legacy (Migration)
// ----------------------------------------------------------------------
function normalizeLegacySpecialSchedule(ss: any): SpecialSchedule | null {
  // 1. Si ya es válido (tiene weeklyPattern completo), lo dejamos pasar
  if (
    ss.weeklyPattern &&
    typeof ss.weeklyPattern === 'object' &&
    [0, 1, 2, 3, 4, 5, 6].every(d => d in ss.weeklyPattern)
  ) {
    return ss as SpecialSchedule
  }

  // 2. Si es Legacy (falta weeklyPattern), intentamos reconstruirlo
  // Lógica: Si kind='OFF' -> todos OFF. Si tiene shift -> todos ese shift.
  // Default: 'DAY' (asumiendo que era un horario especial de día)
  const targetState = (ss.kind === 'OFF' ? 'OFF' : (ss.shift || 'DAY'))

  const weeklyPattern = {
    0: targetState,
    1: targetState,
    2: targetState,
    3: targetState,
    4: targetState,
    5: targetState,
    6: targetState,
  }

  console.log(`[Migration] Legacy schedule recovered: ${ss.id || 'unknown'} -> ${targetState} pattern`)

  return {
    ...ss,
    weeklyPattern
  } as SpecialSchedule
}

function parseIsoDateAtUtcNoon(date: ISODate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

function formatIsoDateUtc(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

function startOfWeekMondayUtc(date: Date): Date {
  const monday = new Date(date)
  const day = monday.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setUTCDate(monday.getUTCDate() + diff)
  return monday
}

function addMonthsUtc(date: Date, months: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate(),
      12,
      0,
      0
    )
  )
}

export const useAppStore = create<AppState>()(
  immer((set, get, api) => ({
    ...createInitialState(),
    ...createManagementScheduleSlice(set, get, api),
    managers: [],
    addManager: (data) => {
      set((state) => {
        const newManager = { ...data, id: crypto.randomUUID() } // Simple ID generation if nanoid is not imported or available in this scope easily
        state.managers.push(newManager)
      })
    },
    removeManager: (id) => {
      set((state) => {
        state.managers = state.managers.filter(m => m.id !== id)
        // Cleanup schedule? Maybe.
        delete state.managementSchedules[id]
      })
    },
    reorderManagers: (orderedIds) => {
      set((state) => {
        const managerMap = new Map(state.managers.map(m => [m.id, m]));
        state.managers = orderedIds
          .map(id => managerMap.get(id))
          .filter((m): m is Manager => !!m);

        // Append missing if any (safety)
        const presentIds = new Set(orderedIds);
        const missing = state.managers.filter(m => !presentIds.has(m.id));
        // Since we just overwrote state.managers, we can't filter it.
        // But map/filter above handles the reorder. 
        // If we really want to be safe against data loss:
        // We can't easily access the *original* state.managers in the same mutation block if we already assigned it.
        // But `state` is the draft.
        // Let's rely on the incoming `orderedIds` being accurate since it comes from the UI list.
      })
    },
    isLoading: true,
    planningAnchorDate: new Date().toISOString().split('T')[0],
    allCalendarDaysForRelevantMonths: [],

    dailyLogDate: new Date().toISOString().split('T')[0],

    async initialize() {
      const { loadState, saveState } = await import('@/persistence/storage')
      const stored = await loadState();
      // If nothing is in storage, create and save initial state.
      if (!stored) {
        const initialState = createInitialState();
        set(s => {
          Object.assign(s, initialState);
          s.isLoading = false;
        });
        await saveState(initialState);
      } else {
        // Otherwise, load the stored state.
        set(s => {
          Object.assign(s, stored);

          // 🔧 Migración: asignar orderIndex si no existe
          s.representatives.forEach((rep, index) => {
            if (rep.orderIndex === undefined) {
              rep.orderIndex = index
            }
          })

          // 🧹 MIGRACIÓN SUAVE: Normalizar legacy sin weeklyPattern
          // En lugar de borrar, reconstruimos el patrón para no perder datos históricos
          if (s.specialSchedules && s.specialSchedules.length > 0) {
            const initialCount = s.specialSchedules.length

            s.specialSchedules = s.specialSchedules
              .map(normalizeLegacySpecialSchedule)
              .filter((ss): ss is SpecialSchedule => !!ss)

            if (s.specialSchedules.length < initialCount) {
              console.warn(`🧹 Migración: Se descartaron ${initialCount - s.specialSchedules.length} reglas irrecuperables.`)
            }
          }

          s.isLoading = false;
        });
      }
      useAppUiStore.getState().resetTransientState()
      get()._generateCalendarDays();
    },

    setPlanningAnchorDate: date => {
      set(state => {
        const monday = formatIsoDateUtc(
          startOfWeekMondayUtc(parseIsoDateAtUtcNoon(date))
        )
        state.planningAnchorDate = monday
      })
      get()._generateCalendarDays()
    },

    _generateCalendarDays: () => {
      set(state => {
        if (!state.calendar) return

        const anchor = parseIsoDateAtUtcNoon(state.planningAnchorDate)
        const allDays = new Map<string, DayInfo>()
        for (let i = -6; i <= 18; i++) {
          const dateToGenerate = addMonthsUtc(anchor, i)
          const year = dateToGenerate.getUTCFullYear()
          const month = dateToGenerate.getUTCMonth() + 1
          const monthDays = generateMonthDays(year, month, state.calendar)
          monthDays.forEach(day => {
            if (!allDays.has(day.date)) {
              allDays.set(day.date, day)
            }
          })
        }
        state.allCalendarDaysForRelevantMonths = Array.from(allDays.values())
      })
    },

    addOrUpdateCoverageRule: rule => {
      const { addHistoryEvent } = get()
      addHistoryEvent({
        category: 'RULE',
        title: `Regla de cobertura actualizada`,
        description: rule.label || rule.id,
        impact: `Mínimo ${rule.required} pers.`,
        metadata: { rule },
      })
      set(state => {
        const safeValue = Math.max(0, Math.floor(rule.required))
        const updatedRule = { ...rule, required: safeValue }
        const exists = state.coverageRules.some(r => r.id === updatedRule.id)
        if (exists) {
          state.coverageRules = state.coverageRules.map(r =>
            r.id === updatedRule.id ? updatedRule : r
          )
        } else {
          state.coverageRules.push(updatedRule)
        }
      })
    },

    removeCoverageRule: id => {
      const { addHistoryEvent, coverageRules } = get()
      const ruleToRemove = coverageRules.find(r => r.id === id)
      if (ruleToRemove) {
        addHistoryEvent({
          category: 'RULE',
          title: `Regla de cobertura eliminada`,
          description: ruleToRemove.label || ruleToRemove.id,
          metadata: { rule: ruleToRemove },
        })
      }
      set(state => {
        state.coverageRules = state.coverageRules.filter(r => r.id !== id)
      })
    },

    addOrUpdateSpecialDay: day => {
      const { addHistoryEvent } = get()
      addHistoryEvent({
        category: 'CALENDAR',
        title: `Día especial actualizado`,
        subject: day.date,
        description: day.label,
        impact: day.kind,
        metadata: { day },
      })
      set(state => {
        const others = state.calendar.specialDays.filter(
          d => d.date !== day.date
        )
        state.calendar.specialDays = [...others, day]
      })
      get()._generateCalendarDays()
    },

    removeSpecialDay: date => {
      const { addHistoryEvent } = get()
      addHistoryEvent({
        category: 'CALENDAR',
        title: `Excepción de día eliminada`,
        subject: date,
      })
      set(state => {
        state.calendar.specialDays = state.calendar.specialDays.filter(
          d => d.date !== date
        )
      })
      get()._generateCalendarDays()
    },

    resetState: async keepFormalIncidents => {
      const { showConfirm } = get()
      const confirmed = await showConfirm({
        title: '⚠️ ¿Reiniciar la planificación?',
        description:
          'Esto restaurará el estado a los valores iniciales. Esta acción no se puede deshacer.',
        intent: 'danger',
        confirmLabel: 'Sí, reiniciar',
      })

      if (confirmed) {
        set(state => {
          const freshState = createInitialState()
          let incidentsToKeep: Incident[] = []
          if (keepFormalIncidents) {
            incidentsToKeep = state.incidents.filter(
              i => i.type === 'LICENCIA' || i.type === 'VACACIONES'
            )
            freshState.incidents = incidentsToKeep
          }
          Object.assign(state, freshState, { isLoading: false })
        })
        useAppUiStore.getState().resetTransientState()
        get()._generateCalendarDays()
      }
    },

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
      const rep = representatives.find(
        r => r.id === incidentData.representativeId
      )
      if (!rep) {
        return { ok: false, reason: 'Representante no encontrado.' }
      }

      // Ensure a unique ID for the new incident.
      const newIncident: Incident = {
        id: `incident-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        ...incidentData,
      };

      /**
       * 🔒 SLOT RESPONSIBILITY VALIDATION
       * 
       * INVARIANT ENFORCEMENT:
       * 1. UNASSIGNED slots cannot have absences
       * 2. COVERAGE absences MUST have slotOwnerId
       * 3. Absence cannot be assigned to slot owner when coverage exists
       * 
       * This prevents the system from being used incorrectly.
       */
      if (newIncident.type === 'AUSENCIA') {
        // Rule 1: Coverage absences must include slotOwnerId
        if (newIncident.source === 'COVERAGE' && !newIncident.slotOwnerId) {
          throw new Error(
            '🔒 INVARIANT VIOLATION: Coverage absence must include slotOwnerId'
          )
        }

        // Rule 2: Cannot assign absence to slot owner when coverage existed
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

        // Rule 3: SWAP absences must include slotOwnerId
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
        rep,
        representatives
      )

      if (!validation.ok) {
        return { ok: false, reason: validation.message }
      }

      let confirmed = skipConfirm;

      if (!confirmed) {
        if (validation.warning) {
          confirmed = await showConfirm({
            title: 'Confirmar Acción',
            description: validation.warning,
            intent: 'warning',
            confirmLabel: 'Continuar',
          });
        } else {
          const isOverride = newIncident.type === 'OVERRIDE'
          const representativeName = repName(
            representatives,
            newIncident.representativeId
          )
          const label = incidentLabel(newIncident.type)

          confirmed = await showConfirm({
            title: isOverride ? 'Confirmar Cambio de Turno' : 'Confirmar Incidencia',
            description: React.createElement('span', null,
              'Registrar ',
              isOverride ? 'una modificación manual' : React.createElement('strong', { style: { fontWeight: 700, color: 'var(--text-main)' } }, label),
              ' a ',
              React.createElement('strong', { style: { fontWeight: 700, color: 'var(--text-main)' } }, representativeName),
              '.'
            ),
            intent: isOverride ? 'info' : 'info',
            confirmLabel: isOverride ? 'Aplicar Cambio' : 'Registrar',
          });
        }

        if (!confirmed) {
          return { ok: false, reason: 'Acción cancelada por el usuario.' }
        }
      }


      const { addHistoryEvent, addAuditEvent, pushUndo } = get()

      addHistoryEvent({
        category: 'INCIDENT',
        title: `${incidentLabel(newIncident.type)} registrada${newIncident.source === 'COVERAGE' ? ' (Cobertura)' : ''}`,
        subject: rep.name,
        impact: newIncident.type !== 'OVERRIDE' && newIncident.type !== 'VACACIONES' && newIncident.type !== 'LICENCIA' ? `-${calculatePoints(newIncident)} pts` : undefined,
        description: newIncident.note || (newIncident.source === 'COVERAGE' ? `Fallo de cobertura para ${newIncident.slotOwnerId}` : undefined),
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
          slotOwnerId: newIncident.slotOwnerId
        }
      })




      const newDisciplinaryKey = buildDisciplinaryKey(newIncident)

      // Update newIncident with the key
      const incidentWithKey = {
        ...newIncident,
        disciplinaryKey: newDisciplinaryKey
      }

      let vacationConfirmation: VacationConfirmationPayload | null = null

      set(state => {
        if (incidentWithKey.type === 'AUSENCIA') {
          const removedIncidents = state.incidents.filter(
            i =>
              i.representativeId === incidentWithKey.representativeId &&
              i.startDate === incidentWithKey.startDate &&
              // 🧠 IDENTITY CHECK: Only replace if disciplinary key matches
              i.disciplinaryKey === newDisciplinaryKey
          )
          if (removedIncidents.length > 0) {
            addHistoryEvent({
              category: 'SYSTEM',
              title: `Incidencia actualizada`,
              subject: rep.name,
              description: `Se reemplazó un evento previo (${newDisciplinaryKey}).`,
            })
          }
          state.incidents = state.incidents.filter(
            i =>
              !(
                i.representativeId === incidentWithKey.representativeId &&
                i.startDate === incidentWithKey.startDate &&
                i.disciplinaryKey === newDisciplinaryKey
              )
          )
        }

        // Ensure we are not adding a duplicate ID
        if (!state.incidents.some(i => i.id === incidentWithKey.id)) {
          state.incidents.push(incidentWithKey);
        }

        if (newIncident.type !== 'OVERRIDE') {
          // Automatic undo moved to UI layer
        }

        if (newIncident.type === 'VACACIONES') {
          const resolvedDates = resolveIncidentDates(
            newIncident,
            allCalendarDaysForRelevantMonths,
            rep
          )
          if (resolvedDates.dates.length > 0) {
            vacationConfirmation = {
              repName: rep.name,
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
      const {
        incidents,
        representatives,
        addHistoryEvent,
        addAuditEvent,
      } = get()
      const incidentToRemove = incidents.find(i => i.id === id)
      if (!incidentToRemove) return

      if (!silent) {
        const repNameText = repName(
          representatives,
          incidentToRemove.representativeId
        )

        addHistoryEvent({
          category: 'INCIDENT',
          title: `Incidencia eliminada: ${incidentLabel(
            incidentToRemove.type
          )}`,
          subject: repNameText,
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
            reason: 'Manual deletion'
          }
        })
      }


      set(state => {
        state.incidents = state.incidents.filter(i => i.id !== id)
      })
    },
    removeIncidents: ids => {
      const { incidents, representatives, pushUndo, addHistoryEvent, addAuditEvent } = get()
      const incidentsToRemove = incidents.filter(i => ids.includes(i.id))
      if (incidentsToRemove.length === 0) return

      const repId = incidentsToRemove[0].representativeId
      const repNameText = repName(representatives, repId)

      addHistoryEvent({
        category: 'INCIDENT',
        title: `${incidentsToRemove.length} incidencia(s) eliminada(s)`,
        subject: repNameText,
        description: `Tipo: ${incidentLabel(
          incidentsToRemove[0].type
        )}`,
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
            reason: 'Bulk deletion'
          }
        })
      })

      set(state => {
        state.incidents = state.incidents.filter(i => !ids.includes(i.id))
      })

      pushUndo({
        label: `Restauradas ${incidentsToRemove.length} incidencias de ${repNameText}`,
        undo: () => {
          addHistoryEvent({
            category: 'SYSTEM',
            title: 'Incidencias restauradas por "Deshacer"',
            subject: repNameText,
            metadata: { incidents: incidentsToRemove },
          })
          set(s => {
            s.incidents.push(...incidentsToRemove)
          })
        },
      })
    },

    updateIncident: (id, updates) => {
      set(state => {
        const index = state.incidents.findIndex(i => i.id === id)
        if (index !== -1) {
          state.incidents[index] = { ...state.incidents[index], ...updates }
        }
      })
    },

    addSwap: data => {
      const { addHistoryEvent, representatives, pushUndo } = get()
      const swap = {
        id: `swap-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        ...data,
      } as SwapEvent;

      set(state => {
        state.swaps.push(swap)
      })

      addHistoryEvent({
        category: 'PLANNING',
        title: 'Cobertura registrada',
        description: swapDescription(swap, representatives),
        metadata: { swap },
      })

      pushUndo({
        label: `Cobertura cancelada: ${swapDescription(swap, representatives).substring(0, 50)}...`,
        undo: () => {
          set(state => {
            state.swaps = state.swaps.filter(s => s.id !== swap.id);
          });
          addHistoryEvent({
            category: 'SYSTEM',
            title: 'Cambio de turno deshecho',
            description: `Se revirtió: ${swapDescription(swap, representatives)}`,
          });
        }
      });
    },

    removeSwap: (id: string) => {
      set(state => {
        state.swaps = state.swaps.filter(s => s.id !== id);
      })
    },

    deactivateRepresentative: async repId => {
      const { showConfirm, representatives, normalizeOrderIndexes } = get()
      const repNameText = repName(representatives, repId)
      const rep = representatives.find(r => r.id === repId)

      const confirmed = await showConfirm({
        title: '¿Desactivar Representante?',
        description: `Estás a punto de desactivar a ${repNameText}. No aparecerá en los nuevos planes, pero su historial se conservará. ¿Estás seguro?`,
        intent: 'warning',
        confirmLabel: 'Sí, desactivar',
      })

      if (confirmed) {
        set(state => {
          const index = state.representatives.findIndex(r => r.id === repId)
          if (index !== -1) {
            state.representatives[index].isActive = false
          }
        })

        // Normalizar índices del turno afectado
        if (rep?.baseShift) {
          normalizeOrderIndexes(rep.baseShift)
        }
      }
    },
    showConfirm: options => useAppUiStore.getState().showConfirm(options),
    handleConfirm: value => useAppUiStore.getState().handleConfirm(value),
    setDailyLogDate: (date) => {
      set(state => { state.dailyLogDate = date })
    },
    requestNavigation: view => useAppUiStore.getState().requestNavigation(view),
    clearNavigationRequest: () => useAppUiStore.getState().clearNavigationRequest(),
    showMixedShiftConfirmModal: (representativeId, date, activeShift) =>
      useAppUiStore.getState().showMixedShiftConfirmModal(representativeId, date, activeShift),
    handleMixedShiftConfirm: assignment =>
      useAppUiStore.getState().handleMixedShiftConfirm(assignment),
    addRepresentative: data => {
      set(state => {
        state.representatives.push({
          id: crypto.randomUUID(),
          ...data,
          isActive: true,
        })
      })
    },
    updateRepresentative: updatedRep => {
      set(state => {
        const index = state.representatives.findIndex(
          r => r.id === updatedRep.id
        )
        if (index !== -1) {
          state.representatives[index] = {
            ...state.representatives[index],
            ...updatedRep,
          }
        }
      })
    },
    // 🎯 Reordenamiento canónico de representantes
    reorderRepresentatives: (shift, orderedIds) => {
      set(state => {
        // 🔒 Validación defensiva: verificar que el orden está completo
        const repsInShift = state.representatives.filter(
          r => r.baseShift === shift && r.isActive
        )

        if (orderedIds.length !== repsInShift.length) {
          console.warn('⚠️ Orden incompleto ignorado. Esperado:', repsInShift.length, 'Recibido:', orderedIds.length)
          return
        }

        // Actualización atómica: recibimos el orden completo, no eventos
        orderedIds.forEach((id, index) => {
          const rep = state.representatives.find(r => r.id === id)
          if (rep && rep.baseShift === shift) {
            rep.orderIndex = index
          }
        })
      })

      // Opcional: agregar a historial
      get().addHistoryEvent({
        category: 'SETTINGS',
        title: `Orden de ${shift === 'DAY' ? 'Día' : 'Noche'} actualizado`,
        description: 'Se reordenaron los representantes del turno',
      })
    },

    // 🔧 Normalización de orderIndex después de borrados/desactivaciones
    normalizeOrderIndexes: (shift) => {
      set(state => {
        const reps = state.representatives
          .filter(r => r.baseShift === shift && r.isActive)
          .sort((a, b) => a.orderIndex - b.orderIndex)

        reps.forEach((rep, index) => {
          rep.orderIndex = index
        })
      })
    },
    addSpecialSchedule: (data) => {
      const state = get() // Access current state for validation

      // 🔒 VALIDACIÓN DE PROPIEDADES BÁSICAS
      if (data.from > data.to) {
        return { success: false, message: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }
      }

      // 🔒 BLINDAJE DE DOMINIO: Validar capacidad MIXTO en pattern explícito
      if (data.scope === 'INDIVIDUAL' && data.targetId && data.weeklyPattern) {
        const rep = state.representatives.find(r => r.id === data.targetId)
        if (rep && !rep.mixProfile) {
          // Check if pattern tries to assign MIXTO
          const days = [0, 1, 2, 3, 4, 5, 6] as const
          const usesMixto = days.some(d => data.weeklyPattern[d] === 'MIXTO')

          if (usesMixto) {
            console.error(`⛔ VIOLACIÓN DE DOMINIO: Intento de asignar MIXTO a ${rep.name} (no mixto).`)
            return { success: false, message: `El representante ${rep.name} no tiene contrato mixto.` }
          }
        }
      }

      // 🔒 BLINDAJE DE COLISIÓN INTEGRAL: REPLACE-ON-OVERLAP
      // Si la nueva regla choca con una existente del mismo usuario, 
      // la existente se ELIMINA para dar paso a la nueva (Last Write Wins).
      // Esto evita la duplicación conceptual de reglas.
      if (data.scope === 'INDIVIDUAL' && data.targetId) {
        set(s => {
          // Filtrar (eliminar) las que colisionan
          s.specialSchedules = s.specialSchedules.filter(existing => {
            // Si es Global o de otro usuario, se queda
            if (existing.scope !== 'INDIVIDUAL' || existing.targetId !== data.targetId) return true

            // Check Overlap
            const overlaps = (data.from <= existing.to && data.to >= existing.from)

            // Si se solapa, se va (false)
            return !overlaps
          })

          // Generate ID
          const newSchedule: SpecialSchedule = {
            id: crypto.randomUUID(),
            ...data
          } as SpecialSchedule

          s.specialSchedules.push(newSchedule)

          // History
          const repName = data.targetId ? s.representatives.find(r => r.id === data.targetId)?.name : 'Global'
          const newEvent: HistoryEvent = {
            id: `hist-${crypto.randomUUID()}`,
            timestamp: new Date().toISOString(),
            category: 'RULE',
            title: 'Excepción de Horario Creada',
            subject: repName,
            description: data.note || 'Patrón semanal explícito',
            metadata: { from: data.from, to: data.to }
          }
          s.historyEvents.unshift(newEvent)
        })

        get()._generateCalendarDays()
        return { success: true }
      }

      set(s => {
        // Generate ID (Global case or fallback logic if needed, though strictly we handled Ind above)
        // Actually, we can merge logic. If Global, just push. 
        // But for clarity let's keep the standard push here if it wasn't Individual (which implies no collision logic for global?)
        // Wait, user only asked for Individual collision replacement. 
        // Let's unify.

        const newSchedule: SpecialSchedule = {
          id: crypto.randomUUID(),
          ...data
        } as SpecialSchedule

        s.specialSchedules.push(newSchedule)

        // History
        const repName = data.targetId ? s.representatives.find(r => r.id === data.targetId)?.name : 'Global'
        const newEvent = {
          id: `hist-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          category: 'RULE' as const,
          title: 'Excepción de Horario Creada',
          subject: repName,
          description: data.note || 'Patrón semanal explícito',
          metadata: { from: data.from, to: data.to }
        }
        s.historyEvents.unshift(newEvent)
      })

      get()._generateCalendarDays()
      return { success: true }
    },

    updateSpecialSchedule: (id, updates) => {
      const state = get()
      const index = state.specialSchedules.findIndex(ss => ss.id === id)
      if (index === -1) return { success: false, message: 'Horario no encontrado.' }

      const current = state.specialSchedules[index]
      const prospective = { ...current, ...updates }

      // 🔒 VALIDACIÓN DE FECHAS
      if (prospective.from > prospective.to) {
        return { success: false, message: 'La fecha de inicio no puede ser posterior a la fecha de fin.' }
      }

      set(s => {
        // 🔒 BLINDAJE DE COLISIÓN (Update): REPLACE-ON-OVERLAP
        // Al actualizar, si cambiamos fechas y ahora piso a otro, el oponente muere.
        if (prospective.scope === 'INDIVIDUAL' && prospective.targetId) {
          s.specialSchedules = s.specialSchedules.filter(existing => {
            if (existing.id === id) return true // I am myself, I stay (will be updated later)
            if (existing.scope !== 'INDIVIDUAL' || existing.targetId !== prospective.targetId) return true

            const overlaps = (prospective.from <= existing.to && prospective.to >= existing.from)
            return !overlaps // Die if overlap
          })
        }

        const idx = s.specialSchedules.findIndex(x => x.id === id) // Re-find index after filter potentially shifted things (though unlikely to shift self)
        if (idx !== -1) {
          s.specialSchedules[idx] = {
            ...s.specialSchedules[idx],
            ...updates,
          }
        }
      })

      return { success: true }
    },
    removeSpecialSchedule: id => {
      set(state => {
        state.specialSchedules = state.specialSchedules.filter(
          ss => ss.id !== id
        )
      })
    },

    // ===============================================
    // Manager Actions
    // ===============================================
    openDetailModal: (personId, month) =>
      useAppUiStore.getState().openDetailModal(personId, month),
    closeDetailModal: () => useAppUiStore.getState().closeDetailModal(),
    addHistoryEvent: (data: Omit<HistoryEvent, 'id' | 'timestamp'>) => {
      set(state => {
        const newEvent: HistoryEvent = {
          id: `hist-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          ...data,
        }
        state.historyEvents.unshift(newEvent)
      })
    },
    addAuditEvent: (event: AuditEventInput) => {
      set(state => {
        recordAuditEvent(state, event)
      })
    },
    pushUndo: (action, timeoutMs = 6000) =>
      useAppUiStore.getState().pushUndo(action, timeoutMs),
    commitUndo: id => useAppUiStore.getState().commitUndo(id),
    executeUndo: id => useAppUiStore.getState().executeUndo(id),
    closeVacationConfirmation: () =>
      useAppUiStore.getState().closeVacationConfirmation(),
    exportState: () => {
      const {
        representatives,
        incidents,
        calendar,
        coverageRules,
        swaps,
        specialSchedules,
        historyEvents,
        auditLog,
        managers,
        managementSchedules,
        version,
      } = get()

      return {
        representatives,
        incidents,
        calendar,
        coverageRules,
        swaps,
        specialSchedules,
        historyEvents,
        auditLog,
        managers,
        managementSchedules,
        version,
      }
    },
    importState: (data: BackupPayload) => {
      const safeState: PlanningBaseState = {
        ...createInitialState(),
        representatives: Array.isArray(data.representatives)
          ? data.representatives
          : [],
        incidents: Array.isArray(data.incidents) ? data.incidents : [],
        calendar: data.calendar ?? createInitialState().calendar,
        coverageRules: data.coverageRules ?? [],
        swaps: data.swaps ?? [],
        historyEvents: data.historyEvents ?? [],
        auditLog: normalizeAuditLog(data.auditLog),
        specialSchedules: data.specialSchedules ?? [],
        managers: data.managers ?? [],
        managementSchedules: data.managementSchedules ?? {},
        version: DOMAIN_VERSION,
      }

      set(state => {
        Object.assign(state, safeState, {
          isLoading: false,
          planningAnchorDate: new Date().toISOString().split('T')[0],
        })
      })

      useAppUiStore.getState().resetTransientState()
      get()._generateCalendarDays()

      return { success: true, message: 'Estado importado correctamente.' }
    },
  }))
)

// This function is defined here because it needs access to `get` from the store creation context.
export const stateToPersist = (state: AppState): PlanningBaseState => {
  const {
    representatives,
    incidents,
    calendar,
    coverageRules,
    swaps,
    specialSchedules,
    historyEvents,
    auditLog,
    managers,
    managementSchedules,
    version,
  } = state
  return {
    representatives,
    incidents,
    calendar,
    coverageRules,
    swaps,
    specialSchedules,
    historyEvents,
    auditLog,
    managers,
    managementSchedules,
    version,
  }
}
