import type { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import type { HistoryEvent } from '@/domain/history/types'
import type { SpecialSchedule } from '@/domain/types'
import type { AppState } from './useAppStore'
import { canCurrentUserEditData } from './useAccessStore'

export interface SpecialScheduleSlice {
  addSpecialSchedule: (
    data: Omit<SpecialSchedule, 'id'>
  ) => { success: boolean; message?: string }
  updateSpecialSchedule: (
    id: string,
    updates: Partial<Omit<SpecialSchedule, 'id' | 'representativeId'>>
  ) => { success: boolean; message?: string }
  removeSpecialSchedule: (id: string) => void
}

export function normalizeLegacySpecialSchedule(
  schedule: any
): SpecialSchedule | null {
  if (
    schedule.weeklyPattern &&
    typeof schedule.weeklyPattern === 'object' &&
    [0, 1, 2, 3, 4, 5, 6].every(day => day in schedule.weeklyPattern)
  ) {
    return schedule as SpecialSchedule
  }

  const targetState = schedule.kind === 'OFF' ? 'OFF' : schedule.shift || 'DAY'
  const weeklyPattern = {
    0: targetState,
    1: targetState,
    2: targetState,
    3: targetState,
    4: targetState,
    5: targetState,
    6: targetState,
  }

  console.log(
    `[Migration] Legacy schedule recovered: ${schedule.id || 'unknown'} -> ${targetState} pattern`
  )

  return {
    ...schedule,
    weeklyPattern,
  } as SpecialSchedule
}

export const createSpecialScheduleSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  SpecialScheduleSlice
> = (set, get) => ({
  addSpecialSchedule: data => {
    if (!canCurrentUserEditData()) {
      return { success: false, message: READ_ONLY_ACTION_MESSAGE }
    }

    const state = get()

    if (data.from > data.to) {
      return {
        success: false,
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
      }
    }

    if (data.scope === 'INDIVIDUAL' && data.targetId && data.weeklyPattern) {
      const representative = state.representatives.find(
        rep => rep.id === data.targetId
      )

      if (representative && !representative.mixProfile) {
        const days = [0, 1, 2, 3, 4, 5, 6] as const
        const usesMixto = days.some(day => data.weeklyPattern[day] === 'MIXTO')

        if (usesMixto) {
          console.error(
            `⛔ VIOLACIÓN DE DOMINIO: Intento de asignar MIXTO a ${representative.name} (no mixto).`
          )
          return {
            success: false,
            message: `El representante ${representative.name} no tiene contrato mixto.`,
          }
        }
      }
    }

    if (data.scope === 'INDIVIDUAL' && data.targetId) {
      set(store => {
        store.specialSchedules = store.specialSchedules.filter(existing => {
          if (
            existing.scope !== 'INDIVIDUAL' ||
            existing.targetId !== data.targetId
          ) {
            return true
          }

          const overlaps = data.from <= existing.to && data.to >= existing.from
          return !overlaps
        })

        const newSchedule: SpecialSchedule = {
          id: crypto.randomUUID(),
          ...data,
        }

        store.specialSchedules.push(newSchedule)

        const representativeName = data.targetId
          ? store.representatives.find(rep => rep.id === data.targetId)?.name
          : 'Global'

        const newEvent: HistoryEvent = {
          id: `hist-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          category: 'RULE',
          title: 'Excepción de Horario Creada',
          subject: representativeName,
          description: data.note || 'Patrón semanal explícito',
          metadata: { from: data.from, to: data.to },
        }

        store.historyEvents.unshift(newEvent)
      })

      get()._generateCalendarDays()
      return { success: true }
    }

    set(store => {
      const newSchedule: SpecialSchedule = {
        id: crypto.randomUUID(),
        ...data,
      }

      store.specialSchedules.push(newSchedule)

      const representativeName = data.targetId
        ? store.representatives.find(rep => rep.id === data.targetId)?.name
        : 'Global'

      const newEvent: HistoryEvent = {
        id: `hist-${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        category: 'RULE',
        title: 'Excepción de Horario Creada',
        subject: representativeName,
        description: data.note || 'Patrón semanal explícito',
        metadata: { from: data.from, to: data.to },
      }

      store.historyEvents.unshift(newEvent)
    })

    get()._generateCalendarDays()
    return { success: true }
  },

  updateSpecialSchedule: (id, updates) => {
    if (!canCurrentUserEditData()) {
      return { success: false, message: READ_ONLY_ACTION_MESSAGE }
    }

    const state = get()
    const index = state.specialSchedules.findIndex(schedule => schedule.id === id)
    if (index === -1) {
      return { success: false, message: 'Horario no encontrado.' }
    }

    const current = state.specialSchedules[index]
    const prospective = { ...current, ...updates }

    if (prospective.from > prospective.to) {
      return {
        success: false,
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
      }
    }

    set(store => {
      if (prospective.scope === 'INDIVIDUAL' && prospective.targetId) {
        store.specialSchedules = store.specialSchedules.filter(existing => {
          if (existing.id === id) return true
          if (
            existing.scope !== 'INDIVIDUAL' ||
            existing.targetId !== prospective.targetId
          ) {
            return true
          }

          const overlaps =
            prospective.from <= existing.to && prospective.to >= existing.from
          return !overlaps
        })
      }

      const updatedIndex = store.specialSchedules.findIndex(
        schedule => schedule.id === id
      )

      if (updatedIndex !== -1) {
        store.specialSchedules[updatedIndex] = {
          ...store.specialSchedules[updatedIndex],
          ...updates,
        }
      }
    })

    return { success: true }
  },

  removeSpecialSchedule: id => {
    if (!canCurrentUserEditData()) {
      console.warn('[Access] removeSpecialSchedule bloqueado:', READ_ONLY_ACTION_MESSAGE)
      return
    }

    set(state => {
      state.specialSchedules = state.specialSchedules.filter(
        schedule => schedule.id !== id
      )
    })
  },
})
