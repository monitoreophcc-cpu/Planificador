import { StateCreator } from 'zustand'
import { READ_ONLY_ACTION_MESSAGE } from '@/lib/access/access'
import { ISODate } from '@/domain/types'
import {
    ManagerDuty,
    ManagerPlanDay,
    ManagerWeeklyPlan,
} from '@/domain/management/types'
import { canCurrentUserEditData } from './useAccessStore'

export interface ManagementScheduleSlice {
    managementSchedules: Record<string, ManagerWeeklyPlan>

    setManagerDuty: (
        managerId: string,
        date: ISODate,
        duty: ManagerDuty | null, // null = EMPTY/Reset
        note?: string
    ) => void

    clearManagerDuty: (
        managerId: string,
        date: ISODate
    ) => void

    getManagerAssignment: (
        managerId: string,
        date: ISODate
    ) => ManagerPlanDay | null

    copyManagerWeek: (
        fromDates: string[],
        toDates: string[]
    ) => void
}

export const createManagementScheduleSlice: StateCreator<
    ManagementScheduleSlice,
    [['zustand/immer', never]],
    [],
    ManagementScheduleSlice
> = (set, get) => ({
    managementSchedules: {},

    setManagerDuty: (managerId, date, duty, note) => {
        if (!canCurrentUserEditData()) {
            console.warn('[Access] setManagerDuty bloqueado:', READ_ONLY_ACTION_MESSAGE)
            return
        }

        set((state: any) => {
            if (!state.managementSchedules[managerId]) {
                state.managementSchedules[managerId] = { managerId, days: {} }
            }
            const schedule = state.managementSchedules[managerId]
            schedule.days[date] = {
                duty,
                note: note?.trim() || undefined,
            }
        })
    },

    clearManagerDuty: (managerId, date) => {
        if (!canCurrentUserEditData()) {
            console.warn('[Access] clearManagerDuty bloqueado:', READ_ONLY_ACTION_MESSAGE)
            return
        }

        set((state: any) => {
            const schedule = state.managementSchedules[managerId]
            if (!schedule) return
            delete schedule.days[date]
        })
    },

    getManagerAssignment: (managerId, date) => {
        const schedule = get().managementSchedules[managerId]
        return schedule?.days[date] ?? null
    },

    copyManagerWeek: (fromDates, toDates) => {
        if (!canCurrentUserEditData()) {
            console.warn('[Access] copyManagerWeek bloqueado:', READ_ONLY_ACTION_MESSAGE)
            return
        }

        if (fromDates.length !== toDates.length) return

        set((state: ManagementScheduleSlice) => {
            const schedules = state.managementSchedules as Record<string, ManagerWeeklyPlan>
            Object.keys(schedules).forEach(managerId => {
                const schedule = schedules[managerId]
                // For each day index
                fromDates.forEach((fromDate, index) => {
                    const toDate = toDates[index]
                    const sourceDay = schedule.days[fromDate]

                    if (sourceDay) {
                        schedule.days[toDate] = { ...sourceDay }
                    } else {
                        // If source is empty, clear target? Or leave as is?
                        // Usually "Clone" implies exact copy, so clearing target if source is null.
                        delete schedule.days[toDate]
                    }
                })
            })
        })
    }
})
