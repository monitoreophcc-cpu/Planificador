'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  PlanningBaseState,
  ISODate,
  WeeklyPlan,
  Incident,
  ShiftAssignment,
  SpecialSchedule,
} from '@/domain/types'
import { createInitialState } from '@/domain/state'
import { BackupPayload } from '@/application/backup/types'
import type { HistoryEvent } from '@/domain/history/types'
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
import { DOMAIN_VERSION } from './appStoreConstants'
import {
  exportPlanningState,
  importAppState,
  initializeAppState,
} from './appStorePersistence'


export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

let hasCloudSyncWatcher = false

function buildCloudPlanHistoryEvents(weeklyPlans: WeeklyPlan[]): HistoryEvent[] {
  return [...weeklyPlans]
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .map(plan => ({
      id: `hist-cloud-plan-${plan.weekStart}`,
      timestamp: `${plan.weekStart}T12:00:00.000Z`,
      category: 'PLANNING',
      title: 'Plan semanal sincronizado',
      description: 'Importado desde Supabase',
      metadata: {
        weeklyPlan: plan,
        source: 'SUPABASE',
      },
    }))
}

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

  // Actions
  triggerCloudSync: () => void

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
    cloudSyncStatus: 'synced',

    triggerCloudSync: () => {
      void (async () => {
        try {
          if (typeof window !== 'undefined' && !window.navigator.onLine) {
            set(state => { state.cloudSyncStatus = 'offline' })
            return
          }

          set(state => { state.cloudSyncStatus = 'syncing' })

          const [{ createClient }, { syncAll }] = await Promise.all([
            import('@/lib/supabase/client'),
            import('@/persistence/supabase-sync'),
          ])

          const supabase = createClient()
          const { data } = await supabase.auth.getSession()
          const userId = data.session?.user.id

          if (!userId) {
            set(state => { state.cloudSyncStatus = 'synced' })
            return
          }

          const result = await syncAll(get(), userId)
          set(state => {
            state.cloudSyncStatus = result.success ? 'synced' : result.error === 'offline' ? 'offline' : 'error'
          })
        } catch {
          set(state => { state.cloudSyncStatus = 'error' })
        }
      })()
    },

    dailyLogDate: new Date().toISOString().split('T')[0],

    initialize: async () => {
      await initializeAppState(set, get)

      try {
        const [{ createClient }, { loadFromSupabase }] = await Promise.all([
          import('@/lib/supabase/client'),
          import('@/persistence/supabase-sync'),
        ])

        const currentState = get()
        const isLocalEmpty =
          currentState.representatives.length === 0 &&
          currentState.incidents.length === 0 &&
          currentState.swaps.length === 0

        if (isLocalEmpty) {
          const supabase = createClient()
          const { data } = await supabase.auth.getSession()
          const userId = data.session?.user.id

          if (userId) {
            const cloudState = await loadFromSupabase(userId)
            set(state => {
              state.representatives = cloudState.representatives
              state.incidents = cloudState.incidents
              state.swaps = cloudState.swaps
              state.coverageRules = cloudState.coverageRules
              if (
                state.historyEvents.length === 0 &&
                cloudState.weeklyPlans.length > 0
              ) {
                state.historyEvents = buildCloudPlanHistoryEvents(
                  cloudState.weeklyPlans
                )
              }
            })
            get()._generateCalendarDays()
          }
        }
      } catch {
        // Cloud bootstrap is optional. Local IndexedDB remains source of truth.
      }

      if (typeof window !== 'undefined' && !hasCloudSyncWatcher) {
        let lastSignature = ''
        let syncTimer: number | undefined

        const computeSignature = () => {
          const base = stateToPersist(get())
          return JSON.stringify({
            representatives: base.representatives,
            incidents: base.incidents,
            swaps: base.swaps,
            coverageRules: base.coverageRules,
            specialSchedules: base.specialSchedules,
            specialDays: base.calendar.specialDays,
          })
        }

        lastSignature = computeSignature()

        api.subscribe(state => {
          if (state.isLoading) return
          const nextSignature = computeSignature()
          if (nextSignature === lastSignature) return
          lastSignature = nextSignature
          window.clearTimeout(syncTimer)
          syncTimer = window.setTimeout(() => {
            get().triggerCloudSync()
          }, 500)
        })

        window.addEventListener('online', () => {
          get().triggerCloudSync()
        })
        window.addEventListener('offline', () => {
          set(state => {
            state.cloudSyncStatus = 'offline'
          })
        })

        if (!window.navigator.onLine) {
          set(state => {
            state.cloudSyncStatus = 'offline'
          })
        }

        hasCloudSyncWatcher = true
      }
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
      return exportPlanningState(get())
    },
    importState: data => importAppState(set, get, data),
  }))
)

// This function is defined here because it needs access to `get` from the store creation context.
export const stateToPersist = (state: AppState): PlanningBaseState => {
  return exportPlanningState(state)
}
