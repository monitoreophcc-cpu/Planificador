import type { StateCreator } from 'zustand'
import { generateMonthDays } from '@/domain/calendar/state'
import type { CoverageRule, DayInfo, ISODate, SpecialDay } from '@/domain/types'
import type { AppState } from './useAppStore'

export interface PlanningCalendarSlice {
  planningAnchorDate: ISODate
  allCalendarDaysForRelevantMonths: DayInfo[]
  setPlanningAnchorDate: (date: ISODate) => void
  addOrUpdateCoverageRule: (rule: CoverageRule) => void
  removeCoverageRule: (id: string) => void
  addOrUpdateSpecialDay: (day: SpecialDay) => void
  removeSpecialDay: (date: ISODate) => void
  _generateCalendarDays: () => void
}

function parseIsoDateAtUtcNoon(date: ISODate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

function formatIsoDateUtc(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

function startOfWeekMondayUtc(date: Date): Date {
  const monday = new Date(date)
  const day = monday.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setUTCDate(monday.getUTCDate() + diff)
  return monday
}

function addMonthsUtc(date: Date, months: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate(),
      12,
      0,
      0
    )
  )
}

export const createPlanningCalendarSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  PlanningCalendarSlice
> = (set, get) => ({
  planningAnchorDate: new Date().toISOString().split('T')[0],
  allCalendarDaysForRelevantMonths: [],

  setPlanningAnchorDate: date => {
    set(state => {
      const monday = formatIsoDateUtc(
        startOfWeekMondayUtc(parseIsoDateAtUtcNoon(date))
      )

      state.planningAnchorDate = monday
    })

    get()._generateCalendarDays()
  },

  addOrUpdateCoverageRule: rule => {
    get().addHistoryEvent({
      category: 'RULE',
      title: 'Regla de cobertura actualizada',
      description: rule.label || rule.id,
      impact: `Mínimo ${rule.required} pers.`,
      metadata: { rule },
    })

    set(state => {
      const safeValue = Math.max(0, Math.floor(rule.required))
      const updatedRule = { ...rule, required: safeValue }
      const exists = state.coverageRules.some(
        coverageRule => coverageRule.id === updatedRule.id
      )

      if (exists) {
        state.coverageRules = state.coverageRules.map(coverageRule =>
          coverageRule.id === updatedRule.id ? updatedRule : coverageRule
        )
      } else {
        state.coverageRules.push(updatedRule)
      }
    })
  },

  removeCoverageRule: id => {
    const { addHistoryEvent, coverageRules } = get()
    const ruleToRemove = coverageRules.find(rule => rule.id === id)

    if (ruleToRemove) {
      addHistoryEvent({
        category: 'RULE',
        title: 'Regla de cobertura eliminada',
        description: ruleToRemove.label || ruleToRemove.id,
        metadata: { rule: ruleToRemove },
      })
    }

    set(state => {
      state.coverageRules = state.coverageRules.filter(rule => rule.id !== id)
    })
  },

  addOrUpdateSpecialDay: day => {
    get().addHistoryEvent({
      category: 'CALENDAR',
      title: 'Día especial actualizado',
      subject: day.date,
      description: day.label,
      impact: day.kind,
      metadata: { day },
    })

    set(state => {
      const remainingDays = state.calendar.specialDays.filter(
        specialDay => specialDay.date !== day.date
      )

      state.calendar.specialDays = [...remainingDays, day]
    })

    get()._generateCalendarDays()
  },

  removeSpecialDay: date => {
    get().addHistoryEvent({
      category: 'CALENDAR',
      title: 'Excepción de día eliminada',
      subject: date,
    })

    set(state => {
      state.calendar.specialDays = state.calendar.specialDays.filter(
        specialDay => specialDay.date !== date
      )
    })

    get()._generateCalendarDays()
  },

  _generateCalendarDays: () => {
    set(state => {
      if (!state.calendar) return

      const anchor = parseIsoDateAtUtcNoon(state.planningAnchorDate)
      const allDays = new Map<string, DayInfo>()

      for (let i = -6; i <= 18; i++) {
        const dateToGenerate = addMonthsUtc(anchor, i)
        const year = dateToGenerate.getUTCFullYear()
        const month = dateToGenerate.getUTCMonth() + 1
        const monthDays = generateMonthDays(year, month, state.calendar)

        monthDays.forEach(day => {
          if (!allDays.has(day.date)) {
            allDays.set(day.date, day)
          }
        })
      }

      state.allCalendarDaysForRelevantMonths = Array.from(allDays.values())
    })
  },
})
