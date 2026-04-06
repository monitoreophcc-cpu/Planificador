'use client'

import { create } from 'zustand'
import type { ReactNode } from 'react'
import type { ISODate, ShiftAssignment } from '@/domain/types'

export type AppView = 'PLANNING' | 'DAILY_LOG' | 'STATS' | 'SETTINGS'
type ConfirmIntent = 'danger' | 'warning' | 'info'
type PromiseResolve<T> = (value: T) => void

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  intent?: ConfirmIntent
  confirmLabel?: string
  cancelLabel?: string
}

export interface ConfirmState {
  options: ConfirmOptions
  resolve: PromiseResolve<boolean>
}

export interface DetailModalState {
  isOpen: boolean
  personId: string | null
  month: string | null
}

export interface MixedShiftConfirmModalState {
  isOpen: boolean
  representativeId: string | null
  date: ISODate | null
  activeShift: 'DAY' | 'NIGHT'
  resolve: PromiseResolve<ShiftAssignment | null>
}

export interface VacationConfirmationState {
  isOpen: boolean
  repName: string
  startDate: ISODate
  endDate: ISODate
  returnDate: ISODate
  workingDays: number
}

export type VacationConfirmationPayload = Omit<
  VacationConfirmationState,
  'isOpen'
>

export interface UndoAction {
  id: string
  label: string
  undo: () => void
  timeoutId?: number
}

interface AppUiState {
  confirmState: ConfirmState | null
  detailModalState: DetailModalState
  mixedShiftConfirmModalState: MixedShiftConfirmModalState | null
  vacationConfirmationState: VacationConfirmationState | null
  navigationRequest: { view: AppView } | null
  undoStack: UndoAction[]
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
  openVacationConfirmation: (state: VacationConfirmationPayload) => void
  closeVacationConfirmation: () => void
  requestNavigation: (view: AppView) => void
  clearNavigationRequest: () => void
  pushUndo: (
    action: Omit<UndoAction, 'id' | 'timeoutId'>,
    timeoutMs?: number
  ) => void
  commitUndo: (id: string) => void
  executeUndo: (id: string) => void
  resetTransientState: () => void
}

const initialDetailModalState: DetailModalState = {
  isOpen: false,
  personId: null,
  month: null,
}

export const useAppUiStore = create<AppUiState>()((set, get) => ({
  confirmState: null,
  detailModalState: initialDetailModalState,
  mixedShiftConfirmModalState: null,
  vacationConfirmationState: null,
  navigationRequest: null,
  undoStack: [],

  showConfirm: options =>
    new Promise(resolve => {
      set({ confirmState: { options, resolve } })
    }),

  handleConfirm: value => {
    const confirmState = get().confirmState
    if (!confirmState) return
    confirmState.resolve(value)
    set({ confirmState: null })
  },

  openDetailModal: (personId, month) => {
    set({ detailModalState: { isOpen: true, personId, month } })
  },

  closeDetailModal: () => {
    set({ detailModalState: initialDetailModalState })
  },

  showMixedShiftConfirmModal: (representativeId, date, activeShift) =>
    new Promise(resolve => {
      set({
        mixedShiftConfirmModalState: {
          isOpen: true,
          representativeId,
          date,
          activeShift,
          resolve,
        },
      })
    }),

  handleMixedShiftConfirm: assignment => {
    const mixedShiftConfirmModalState = get().mixedShiftConfirmModalState
    if (!mixedShiftConfirmModalState) return
    mixedShiftConfirmModalState.resolve(assignment)
    set({ mixedShiftConfirmModalState: null })
  },

  openVacationConfirmation: state => {
    set({ vacationConfirmationState: { isOpen: true, ...state } })
  },

  closeVacationConfirmation: () => {
    set({ vacationConfirmationState: null })
  },

  requestNavigation: view => {
    set({ navigationRequest: { view } })
  },

  clearNavigationRequest: () => {
    set({ navigationRequest: null })
  },

  pushUndo: (action, timeoutMs = 6000) => {
    const { commitUndo } = get()

    set(state => {
      state.undoStack.forEach(item => clearTimeout(item.timeoutId))

      const id = `undo-${crypto.randomUUID()}`
      const timeoutId = window.setTimeout(() => {
        commitUndo(id)
      }, timeoutMs)

      return {
        undoStack: [{ ...action, id, timeoutId }],
      }
    })
  },

  commitUndo: id => {
    set(state => ({
      undoStack: state.undoStack.filter(action => action.id !== id),
    }))
  },

  executeUndo: id => {
    const { undoStack, commitUndo } = get()
    const action = undoStack.find(item => item.id === id)
    if (!action) return

    clearTimeout(action.timeoutId)
    action.undo()
    commitUndo(id)
  },

  resetTransientState: () => {
    const confirmState = get().confirmState
    const mixedShiftConfirmModalState = get().mixedShiftConfirmModalState
    const undoStack = get().undoStack

    confirmState?.resolve(false)
    mixedShiftConfirmModalState?.resolve(null)
    undoStack.forEach(item => clearTimeout(item.timeoutId))

    set({
      confirmState: null,
      detailModalState: initialDetailModalState,
      mixedShiftConfirmModalState: null,
      vacationConfirmationState: null,
      navigationRequest: null,
      undoStack: [],
    })
  },
}))
