import type { StateCreator } from 'zustand'
import type { Manager } from '@/domain/management/types'
import type { AppState } from './useAppStore'

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
    set(state => {
      state.managers.push({
        ...data,
        id: crypto.randomUUID(),
      })
    })
  },

  removeManager: id => {
    set(state => {
      state.managers = state.managers.filter(manager => manager.id !== id)
      delete state.managementSchedules[id]
    })
  },

  reorderManagers: orderedIds => {
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
