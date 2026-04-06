'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  PlanningBaseState,
  ISODate,
  Incident,
  ShiftAssignment,
  SpecialSchedule,
} from '@/domain/types'
import { createInitialState } from '@/domain/state'
import { BackupPayload } from '@/application/backup/types'
import { normalizeAuditLog } from '@/domain/audit/normalizeAuditEvent'
import { ManagementScheduleSlice, createManagementScheduleSlice } from './managementScheduleSlice'
import { EventLogSlice, createEventLogSlice } from './eventLogSlice'
import {
  ManagerEntitySlice,
  createManagerEntitySlice,
} from './managerEntitySlice'
import {
  PlanningCalendarSlice,
  createPlanningCalendarSlice,
} from './planningCalendarSlice'
import {
  RepresentativeSlice,
  createRepresentativeSlice,
} from './representativeSlice'
import { IncidentSlice, createIncidentSlice } from './incidentSlice'
import {
  SpecialScheduleSlice,
  createSpecialScheduleSlice,
  normalizeLegacySpecialSchedule,
} from './specialScheduleSlice'
import { SwapSlice, createSwapSlice } from './swapSlice'
import {
  useAppUiStore,
  type ConfirmOptions,
  type UndoAction,
} from './useAppUiStore'

export const DOMAIN_VERSION = 7

// --- Main App State ---
export type AppState = PlanningBaseState &
  ManagementScheduleSlice &
  EventLogSlice &
  ManagerEntitySlice &
  PlanningCalendarSlice &
  RepresentativeSlice &
  IncidentSlice &
  SpecialScheduleSlice &
  SwapSlice & {
  isLoading: boolean

  // Actions
  initialize: () => Promise<void>
  resetState: (keepFormalIncidents: boolean) => void
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

  // Undo Actions
  pushUndo: (
    action: Omit<UndoAction, 'id' | 'timeoutId'>,
    timeoutMs?: number
  ) => void
  commitUndo: (id: string) => void
  executeUndo: (id: string) => void

  // Backup/Restore
  exportState: () => PlanningBaseState
  importState: (data: BackupPayload) => Promise<{ success: boolean; message: string }>
}

export const useAppStore = create<AppState>()(
  immer((set, get, api) => ({
    ...createInitialState(),
    ...createManagementScheduleSlice(set, get, api),
    ...createEventLogSlice(set, get, api),
    ...createManagerEntitySlice(set, get, api),
    ...createPlanningCalendarSlice(set, get, api),
    ...createRepresentativeSlice(set, get, api),
    ...createIncidentSlice(set, get, api),
    ...createSpecialScheduleSlice(set, get, api),
    ...createSwapSlice(set, get, api),
    isLoading: true,

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
    openDetailModal: (personId, month) =>
      useAppUiStore.getState().openDetailModal(personId, month),
    closeDetailModal: () => useAppUiStore.getState().closeDetailModal(),
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
    importState: async (data: BackupPayload) => {
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

      try {
        const { useCoverageStore } = await import('./useCoverageStore')
        useCoverageStore
          .getState()
          .replaceCoverages(Array.isArray(data.coverages) ? data.coverages : [])
      } catch (error) {
        console.error(
          '[Backup] El estado base fue restaurado, pero no se pudieron restaurar las coberturas.',
          error
        )
        return {
          success: true,
          message:
            'Estado importado correctamente. Las coberturas no pudieron restaurarse.',
        }
      }

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
