import type { WeeklyPlan } from '@/domain/types'
import type { HistoryEvent } from '@/domain/history/types'

function isWeeklyPlanHistoryEvent(
  event: HistoryEvent
): event is HistoryEvent & { metadata: { weeklyPlan: WeeklyPlan } } {
  if (event.category !== 'PLANNING' || !event.metadata) {
    return false
  }

  const weeklyPlan = (event.metadata as Record<string, unknown>).weeklyPlan

  return (
    typeof weeklyPlan === 'object' &&
    weeklyPlan !== null &&
    typeof (weeklyPlan as WeeklyPlan).weekStart === 'string' &&
    Array.isArray((weeklyPlan as WeeklyPlan).agents)
  )
}

export function extractWeeklyPlansFromHistoryEvents(
  historyEvents: HistoryEvent[]
): WeeklyPlan[] {
  const byWeekStart = new Map<string, WeeklyPlan>()

  historyEvents
    .filter(isWeeklyPlanHistoryEvent)
    .forEach(event => {
      byWeekStart.set(
        event.metadata.weeklyPlan.weekStart,
        event.metadata.weeklyPlan
      )
    })

  return [...byWeekStart.values()].sort((left, right) =>
    left.weekStart.localeCompare(right.weekStart)
  )
}
