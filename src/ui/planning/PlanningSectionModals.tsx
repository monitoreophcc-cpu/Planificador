'use client'

import type { DayInfo, ISODate, ShiftType, SpecialDay, WeeklyPlan } from '@/domain/types'
import { CalendarDayModal } from './CalendarDayModal'
import { PromptDialog } from '../components/PromptDialog'
import { SwapModal } from './SwapModal'
import type { PromptConfig, SwapModalState } from './planningSectionTypes'

type PlanningSectionModalsProps = {
  activeShift: ShiftType
  addOrUpdateSpecialDay: (specialDay: SpecialDay) => void
  editingDay: DayInfo | null
  onClearDay: (date: ISODate) => Promise<void>
  onCloseEditDay: () => void
  onCloseSwapModal: () => void
  planningAnchorDate: ISODate
  promptConfig: PromptConfig | null
  swapModalState: SwapModalState
  weeklyPlan: WeeklyPlan | null
}

export function PlanningSectionModals({
  activeShift,
  addOrUpdateSpecialDay,
  editingDay,
  onClearDay,
  onCloseEditDay,
  onCloseSwapModal,
  planningAnchorDate,
  promptConfig,
  swapModalState,
  weeklyPlan,
}: PlanningSectionModalsProps) {
  return (
    <>
      {editingDay && (
        <CalendarDayModal
          day={editingDay}
          onClose={onCloseEditDay}
          onSave={addOrUpdateSpecialDay}
          onClear={date => {
            void onClearDay(date)
          }}
        />
      )}

      {swapModalState.isOpen && weeklyPlan && (
        <SwapModal
          weeklyPlan={weeklyPlan}
          initialDate={swapModalState.date || planningAnchorDate}
          initialShift={swapModalState.shift || activeShift}
          initialRepId={swapModalState.repId || undefined}
          existingSwap={swapModalState.existingSwap || undefined}
          onClose={onCloseSwapModal}
        />
      )}

      {promptConfig && (
        <PromptDialog
          open={promptConfig.open}
          title={promptConfig.title}
          description={promptConfig.description}
          placeholder={promptConfig.placeholder}
          optional={promptConfig.optional}
          onConfirm={value => promptConfig.resolve(value)}
          onCancel={() => promptConfig.resolve(undefined)}
        />
      )}
    </>
  )
}
