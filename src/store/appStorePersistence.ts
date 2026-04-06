import { createInitialState } from '@/domain/state'
import type { PlanningBaseState, SpecialSchedule } from '@/domain/types'
import type { BackupPayload } from '@/application/backup/types'
import { normalizeAuditLog } from '@/domain/audit/normalizeAuditEvent'
import { useAppUiStore } from './useAppUiStore'
import { DOMAIN_VERSION } from './appStoreConstants'
import { normalizeLegacySpecialSchedule } from './specialScheduleSlice'
import type { AppState } from './useAppStore'

type AppStateSetter = (recipe: (state: AppState) => void) => void
type AppStateGetter = () => AppState

function assignMissingOrderIndexes(state: Pick<AppState, 'representatives'>): void {
  state.representatives.forEach((representative, index) => {
    if (representative.orderIndex === undefined) {
      representative.orderIndex = index
    }
  })
}

function normalizeSpecialSchedules(
  specialSchedules: SpecialSchedule[]
): SpecialSchedule[] {
  if (specialSchedules.length === 0) return specialSchedules

  const initialCount = specialSchedules.length
  const normalized = specialSchedules
    .map(normalizeLegacySpecialSchedule)
    .filter((schedule): schedule is SpecialSchedule => !!schedule)

  if (normalized.length < initialCount) {
    console.warn(
      `🧹 Migración: Se descartaron ${
        initialCount - normalized.length
      } reglas irrecuperables.`
    )
  }

  return normalized
}

function createImportedPlanningState(data: BackupPayload): PlanningBaseState {
  const initialState = createInitialState()

  return {
    ...initialState,
    representatives: Array.isArray(data.representatives)
      ? data.representatives
      : [],
    incidents: Array.isArray(data.incidents) ? data.incidents : [],
    calendar: data.calendar ?? initialState.calendar,
    coverageRules: data.coverageRules ?? [],
    swaps: data.swaps ?? [],
    historyEvents: data.historyEvents ?? [],
    auditLog: normalizeAuditLog(data.auditLog),
    specialSchedules: data.specialSchedules ?? [],
    managers: data.managers ?? [],
    managementSchedules: data.managementSchedules ?? {},
    version: DOMAIN_VERSION,
  }
}

async function restoreImportedCoverages(data: BackupPayload): Promise<boolean> {
  try {
    const { useCoverageStore } = await import('./useCoverageStore')
    useCoverageStore
      .getState()
      .replaceCoverages(Array.isArray(data.coverages) ? data.coverages : [])
    return true
  } catch (error) {
    console.error(
      '[Backup] El estado base fue restaurado, pero no se pudieron restaurar las coberturas.',
      error
    )
    return false
  }
}

export async function initializeAppState(
  set: AppStateSetter,
  get: AppStateGetter
): Promise<void> {
  const { loadState, saveState } = await import('@/persistence/storage')
  const stored = await loadState()

  if (!stored) {
    const initialState = createInitialState()
    set(state => {
      Object.assign(state, initialState)
      state.isLoading = false
    })
    await saveState(initialState)
  } else {
    set(state => {
      Object.assign(state, stored)
      assignMissingOrderIndexes(state)
      state.specialSchedules = normalizeSpecialSchedules(state.specialSchedules)
      state.isLoading = false
    })
  }

  useAppUiStore.getState().resetTransientState()
  get()._generateCalendarDays()
}

export function exportPlanningState(state: AppState): PlanningBaseState {
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

export async function importAppState(
  set: AppStateSetter,
  get: AppStateGetter,
  data: BackupPayload
): Promise<{ success: boolean; message: string }> {
  const safeState = createImportedPlanningState(data)

  set(state => {
    Object.assign(state, safeState, {
      isLoading: false,
      planningAnchorDate: new Date().toISOString().split('T')[0],
    })
  })

  useAppUiStore.getState().resetTransientState()
  get()._generateCalendarDays()

  const coveragesRestored = await restoreImportedCoverages(data)

  return {
    success: true,
    message: coveragesRestored
      ? 'Estado importado correctamente.'
      : 'Estado importado correctamente. Las coberturas no pudieron restaurarse.',
  }
}
