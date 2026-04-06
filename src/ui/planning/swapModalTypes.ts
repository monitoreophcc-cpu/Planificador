import type {
  ISODate,
  ShiftType,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'

export interface SwapModalProps {
  weeklyPlan: WeeklyPlan
  initialDate?: ISODate
  initialShift?: ShiftType
  initialRepId?: string
  existingSwap?: SwapEvent
  onClose: () => void
}
