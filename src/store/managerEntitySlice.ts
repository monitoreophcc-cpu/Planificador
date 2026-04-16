import type { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import type { Manager } from '@/domain/management/types'
import type { AppState } from './useAppStore'
import { canCurrentUserEditData } from './useAccessStore'

export interface ManagerEntitySlice {
  addManager: (data: Omit<Manager, 'id'>) => void
  removeManager: (id: string) => void
  reorderManagers: (orderedIds: string[]) => void
}

export const createManagerEntitySlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  ManagerEntitySlice
> = (set) => ({
  addManager: data => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] addManager bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.managers.push({
        ...data,
        id: crypto.randomUUID(),
      })
    })
  },

  removeManager: id => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] removeManager bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.managers = state.managers.filter(manager => manager.id !== id)
      delete state.managementSchedules[id]
    })
  },

  reorderManagers: orderedIds => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] reorderManagers bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      const managerMap = new Map(
        state.managers.map(manager => [manager.id, manager] as const)
      )

      state.managers = orderedIds
        .map(id => managerMap.get(id))
        .filter((manager): manager is Manager => !!manager)
    })
  },
})
