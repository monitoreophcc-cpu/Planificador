import type { WeeklyPlan } from '@/domain/types'
import type { HistoryEvent } from '@/domain/history/types'

type PlanningHistoryEvent = HistoryEvent & {
  metadata: {
    weeklyPlan: WeeklyPlan
  }
}

export function getWeeklyPlansForMonth(
  historyEvents: HistoryEvent[],
  monthISO: string
) {
  return historyEvents
    .filter(isPlanningEventWithWeeklyPlan)
    .filter(event => event.metadata.weeklyPlan.weekStart.startsWith(monthISO))
    .map(event => event.metadata.weeklyPlan)
}

function isPlanningEventWithWeeklyPlan(
  event: HistoryEvent
): event is PlanningHistoryEvent {
  if (event.category !== 'PLANNING' || !event.metadata) {
    return false
  }

  const weeklyPlan = event.metadata.weeklyPlan

  return (
    typeof weeklyPlan === 'object' &&
    weeklyPlan !== null &&
    typeof (weeklyPlan as WeeklyPlan).weekStart === 'string'
  )
}
