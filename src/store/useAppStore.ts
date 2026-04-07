'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  PlanningBaseState,
  ISODate,
  ShiftAssignment,
} from '@/domain/types'
import { createInitialState } from '@/domain/state'
import type { BackupPayload } from '@/application/backup/types'
import {
  ManagementScheduleSlice,
  createManagementScheduleSlice,
} from './managementScheduleSlice'
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
} from './specialScheduleSlice'
import { SwapSlice, createSwapSlice } from './swapSlice'
import {
  useAppUiStore,
  type ConfirmOptions,
  type UndoAction,
} from './useAppUiStore'
import {
  exportPlanningState,
  importAppState,
  initializeAppState,
} from './appStorePersistence'
import { useCloudSyncStore, type CloudSyncStatus } from './useCloudSyncStore'
import {
  extractWeeklyPlansFromHistoryEvents,
  ensureCloudSyncWatcher,
  loadCloudSnapshotIfNeeded,
  mergeCloudPlanningHistory,
  runCloudSync,
} from './appStoreCloudSync'
import { createAppStoreUiBridge } from './appStoreUiBridge'

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
    cloudSyncStatus: CloudSyncStatus
    triggerCloudSync: () => Promise<void>
    initialize: () => Promise<void>
    resetState: (keepFormalIncidents: boolean) => Promise<void>
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
    dailyLogDate: ISODate
    setDailyLogDate: (date: ISODate) => void
    requestNavigation: (
      view: 'PLANNING' | 'DAILY_LOG' | 'STATS' | 'SETTINGS'
    ) => void
    clearNavigationRequest: () => void
    pushUndo: (
      action: Omit<UndoAction, 'id' | 'timeoutId'>,
      timeoutMs?: number
    ) => void
    commitUndo: (id: string) => void
    executeUndo: (id: string) => void
    exportState: () => PlanningBaseState
    importState: (
      data: BackupPayload
    ) => Promise<{ success: boolean; message: string }>
  }

export const useAppStore = create<AppState>()(
  immer((set, get, api) => {
    const setCloudStatus = (status: CloudSyncStatus) => {
      set(state => {
        state.cloudSyncStatus = status
      })
      useCloudSyncStore.getState().setStatus(status)
    }

    const setWithCloudSync: typeof set = (...args) => {
      set(...args)

      const state = get()
      if (state.isLoading) return

      queueMicrotask(() => {
        void get().triggerCloudSync()
      })
    }

    return {
      ...createInitialState(),
      ...createManagementScheduleSlice(setWithCloudSync, get, api),
      ...createEventLogSlice(setWithCloudSync, get, api),
      ...createManagerEntitySlice(setWithCloudSync, get, api),
      ...createPlanningCalendarSlice(setWithCloudSync, get, api),
      ...createRepresentativeSlice(setWithCloudSync, get, api),
      ...createIncidentSlice(setWithCloudSync, get, api),
      ...createSpecialScheduleSlice(setWithCloudSync, get, api),
      ...createSwapSlice(setWithCloudSync, get, api),
      isLoading: true,
      cloudSyncStatus: 'synced',
      dailyLogDate: new Date().toISOString().split('T')[0],

      triggerCloudSync: async () => runCloudSync(get, setCloudStatus),

      initialize: async () => {
        await initializeAppState(set, get)

        try {
          const cloudState = await loadCloudSnapshotIfNeeded(get())

          if (cloudState) {
            set(state => {
              state.representatives = cloudState.representatives
              state.incidents = cloudState.incidents
              state.swaps = cloudState.swaps

              if (cloudState.coverageRules.length > 0) {
                state.coverageRules = cloudState.coverageRules
              }

              if (
                extractWeeklyPlansFromHistoryEvents(state.historyEvents).length === 0 &&
                cloudState.weeklyPlans.length > 0
              ) {
                state.historyEvents = mergeCloudPlanningHistory(
                  state.historyEvents,
                  cloudState.weeklyPlans
                )
              }
            })

            get()._generateCalendarDays()
          }
        } catch (error) {
          console.error(
            '[Cloud Bootstrap] No se pudo hidratar desde Supabase. Se mantiene IndexedDB como fuente local.',
            error
          )
        }

        ensureCloudSyncWatcher(
          listener => api.subscribe(listener),
          get,
          get().triggerCloudSync,
          setCloudStatus
        )
      },

      resetState: async keepFormalIncidents => {
        const confirmed = await get().showConfirm({
          title: '⚠️ ¿Reiniciar la planificación?',
          description:
            'Esto restaurará el estado a los valores iniciales. Esta acción no se puede deshacer.',
          intent: 'danger',
          confirmLabel: 'Sí, reiniciar',
        })

        if (!confirmed) return

        setWithCloudSync(state => {
          const freshState = createInitialState()

          if (keepFormalIncidents) {
            freshState.incidents = state.incidents.filter(
              incident =>
                incident.type === 'LICENCIA' || incident.type === 'VACACIONES'
            )
          }

          Object.assign(state, freshState, { isLoading: false })
        })

        useAppUiStore.getState().resetTransientState()
        get()._generateCalendarDays()
      },

      ...createAppStoreUiBridge(),
      setDailyLogDate: date => {
        set(state => {
          state.dailyLogDate = date
        })
      },
      exportState: () => exportPlanningState(get()),
      importState: async data => {
        const result = await importAppState(set, get, data)
        void get().triggerCloudSync()
        return result
      },
    }
  })
)

// This function is defined here because it needs access to the store state shape.
export const stateToPersist = (state: AppState): PlanningBaseState => {
  return exportPlanningState(state)
}
