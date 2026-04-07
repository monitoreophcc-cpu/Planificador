'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  PlanningBaseState,
  ISODate,
  WeeklyPlan,
  Incident,
  ShiftAssignment,
} from '@/domain/types'
import { createInitialState } from '@/domain/state'
import type { BackupPayload } from '@/application/backup/types'
import type { HistoryEvent } from '@/domain/history/types'
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
import { createClient } from '@/lib/supabase/client'
import {
  extractWeeklyPlansFromHistoryEvents,
  loadFromSupabase,
  syncAll,
} from '@/persistence/supabase-sync'
import { useCloudSyncStore, type CloudSyncStatus } from './useCloudSyncStore'

let hasCloudSyncWatcher = false

function buildCloudPlanHistoryEvents(weeklyPlans: WeeklyPlan[]): HistoryEvent[] {
  return [...weeklyPlans]
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart))
    .map(plan => ({
      id: `hist-cloud-plan-${plan.weekStart}`,
      timestamp: `${plan.weekStart}T12:00:00.000Z`,
      category: 'PLANNING' as const,
      title: 'Plan semanal sincronizado',
      description: 'Importado desde Supabase',
      metadata: {
        weeklyPlan: plan,
        source: 'SUPABASE',
      },
    }))
}

function mergeCloudPlanningHistory(
  historyEvents: HistoryEvent[],
  weeklyPlans: WeeklyPlan[]
): HistoryEvent[] {
  const nonPlanningHistory = historyEvents.filter(
    event => event.category !== 'PLANNING'
  )

  return [...nonPlanningHistory, ...buildCloudPlanHistoryEvents(weeklyPlans)]
}

function computeCloudSignature(state: Pick<AppState, 'representatives' | 'incidents' | 'swaps' | 'coverageRules' | 'historyEvents'>): string {
  return JSON.stringify({
    representatives: state.representatives,
    incidents: state.incidents,
    swaps: state.swaps,
    coverageRules: state.coverageRules,
    weeklyPlans: extractWeeklyPlansFromHistoryEvents(state.historyEvents),
  })
}

function hasLocalCloudData(state: Pick<AppState, 'representatives' | 'incidents' | 'swaps' | 'coverageRules' | 'historyEvents'>): boolean {
  return (
    state.representatives.length > 0 ||
    state.incidents.length > 0 ||
    state.swaps.length > 0 ||
    extractWeeklyPlansFromHistoryEvents(state.historyEvents).length > 0
  )
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

      triggerCloudSync: async () => {
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
          setCloudStatus('offline')
          return
        }

        try {
          const supabase = createClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session?.user.id) {
            setCloudStatus('synced')
            return
          }

          setCloudStatus('syncing')

          const result = await syncAll(get(), session.user.id)

          if (result.success) {
            setCloudStatus('synced')
          } else if (result.error === 'offline_pending_sync') {
            setCloudStatus('offline')
          } else {
            setCloudStatus('error')
          }
        } catch (error) {
          console.error('[Cloud Sync] No se pudo sincronizar con Supabase.', error)
          setCloudStatus('error')
        }
      },

      initialize: async () => {
        await initializeAppState(set, get)

        try {
          const supabase = createClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session?.user.id && !hasLocalCloudData(get())) {
            const cloudState = await loadFromSupabase(session.user.id)

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

        if (typeof window !== 'undefined' && !hasCloudSyncWatcher) {
          let lastSignature = computeCloudSignature(get())
          let syncTimer: number | undefined

          api.subscribe(state => {
            if (state.isLoading) return

            const nextSignature = computeCloudSignature(state)
            if (nextSignature === lastSignature) return

            lastSignature = nextSignature
            window.clearTimeout(syncTimer)
            syncTimer = window.setTimeout(() => {
              void get().triggerCloudSync()
            }, 500)
          })

          window.addEventListener('online', () => {
            void get().triggerCloudSync()
          })

          hasCloudSyncWatcher = true
        }

        if (typeof window !== 'undefined' && window.navigator.onLine) {
          void get().triggerCloudSync()
        } else {
          setCloudStatus('offline')
        }
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

      showConfirm: options => useAppUiStore.getState().showConfirm(options),
      handleConfirm: value => useAppUiStore.getState().handleConfirm(value),
      setDailyLogDate: date => {
        set(state => {
          state.dailyLogDate = date
        })
      },
      requestNavigation: view =>
        useAppUiStore.getState().requestNavigation(view),
      clearNavigationRequest: () =>
        useAppUiStore.getState().clearNavigationRequest(),
      showMixedShiftConfirmModal: (representativeId, date, activeShift) =>
        useAppUiStore
          .getState()
          .showMixedShiftConfirmModal(representativeId, date, activeShift),
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
