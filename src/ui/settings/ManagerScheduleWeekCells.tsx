'use client'

import { mapManagerDayToCell } from '@/application/ui-adapters/mapManagerDayToCell'
import { resolveEffectiveManagerDay } from '@/application/ui-adapters/resolveEffectiveManagerDay'
import { ManagerPlannerCell } from '@/ui/management/ManagerPlannerCell'
import type { DayInfo, Incident, Representative } from '@/domain/types'
import type { Manager, ManagerWeeklyPlan } from '@/domain/management/types'

type ManagerScheduleWeekCellsProps = {
  allCalendarDaysForRelevantMonths: DayInfo[]
  handleDutyChange: (managerId: string, date: string, value: string) => void
  incidents: Incident[]
  manager: Manager
  representative?: Representative
  weekDays: DayInfo[]
  weeklyPlan: ManagerWeeklyPlan | null
}

export function ManagerScheduleWeekCells({
  allCalendarDaysForRelevantMonths,
  handleDutyChange,
  incidents,
  manager,
  representative,
  weekDays,
  weeklyPlan,
}: ManagerScheduleWeekCellsProps) {
  return (
    <>
      {weekDays.map(day => {
        const effectiveDay = resolveEffectiveManagerDay(
          weeklyPlan,
          incidents,
          day.date,
          allCalendarDaysForRelevantMonths,
          representative
        )

        const cellState = mapManagerDayToCell(effectiveDay, manager.name)
        const currentValue = getManagerPlannerCurrentValue(effectiveDay)
        const isEditable =
          cellState.isEditable &&
          effectiveDay.kind !== 'VACATION' &&
          effectiveDay.kind !== 'LICENSE'

        return (
          <td key={day.date} style={{ padding: '6px' }}>
            <ManagerPlannerCell
              state={cellState.state}
              label={cellState.label}
              tooltip={cellState.tooltip}
              currentValue={currentValue}
              onChange={
                isEditable
                  ? value => handleDutyChange(manager.id, day.date, value)
                  : undefined
              }
            />
          </td>
        )
      })}
    </>
  )
}

function getManagerPlannerCurrentValue(
  effectiveDay: ReturnType<typeof resolveEffectiveManagerDay>
) {
  if (effectiveDay.kind === 'DUTY') {
    return effectiveDay.duty
  }

  if (effectiveDay.kind === 'OFF') {
    return 'OFF'
  }

  return 'EMPTY'
}
