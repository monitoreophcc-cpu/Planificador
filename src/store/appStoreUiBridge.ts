import type { ISODate, ShiftAssignment } from '@/domain/types'
import {
  useAppUiStore,
  type ConfirmOptions,
  type UndoAction,
} from './useAppUiStore'

export interface AppStoreUiBridge {
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
}

export function createAppStoreUiBridge(): AppStoreUiBridge {
  return {
    showConfirm: options => useAppUiStore.getState().showConfirm(options),
    handleConfirm: value => useAppUiStore.getState().handleConfirm(value),
    openDetailModal: (personId, month) =>
      useAppUiStore.getState().openDetailModal(personId, month),
    closeDetailModal: () => useAppUiStore.getState().closeDetailModal(),
    showMixedShiftConfirmModal: (representativeId, date, activeShift) =>
      useAppUiStore
        .getState()
        .showMixedShiftConfirmModal(representativeId, date, activeShift),
    handleMixedShiftConfirm: assignment =>
      useAppUiStore.getState().handleMixedShiftConfirm(assignment),
    closeVacationConfirmation: () =>
      useAppUiStore.getState().closeVacationConfirmation(),
    requestNavigation: view =>
      useAppUiStore.getState().requestNavigation(view),
    clearNavigationRequest: () =>
      useAppUiStore.getState().clearNavigationRequest(),
    pushUndo: (action, timeoutMs = 6000) =>
      useAppUiStore.getState().pushUndo(action, timeoutMs),
    commitUndo: id => useAppUiStore.getState().commitUndo(id),
    executeUndo: id => useAppUiStore.getState().executeUndo(id),
  }
}
