import type {
  ISODate,
  ShiftType,
  SwapEvent,
  SwapType,
} from '@/domain/types'
import {
  resolveInitialSwapModalDate,
  resolveInitialSwapModalMode,
  type SwapModalMode,
} from './swapModalHelpers'

export type SwapModalStateValues = {
  date: ISODate
  fromId: string
  modalMode: SwapModalMode
  note: string
  shift: ShiftType
  toId: string
  type: SwapType
}

type CreateInitialSwapModalStateArgs = {
  existingSwap?: SwapEvent
  initialDate?: ISODate
  initialRepId?: string
  initialShift?: ShiftType
  planningAnchorDate: ISODate
}

function resolveInitialFromId(
  initialRepId: string | undefined,
  existingSwap?: SwapEvent
) {
  if (initialRepId) return initialRepId
  if (existingSwap && 'fromRepresentativeId' in existingSwap) {
    return existingSwap.fromRepresentativeId
  }
  return ''
}

function resolveInitialToId(existingSwap?: SwapEvent) {
  if (existingSwap && 'toRepresentativeId' in existingSwap) {
    return existingSwap.toRepresentativeId
  }

  if (existingSwap && 'representativeId' in existingSwap) {
    return existingSwap.representativeId
  }

  return ''
}

export function createInitialSwapModalState({
  existingSwap,
  initialDate,
  initialRepId,
  initialShift,
  planningAnchorDate,
}: CreateInitialSwapModalStateArgs): SwapModalStateValues {
  return {
    date: resolveInitialSwapModalDate(initialDate, planningAnchorDate),
    modalMode: resolveInitialSwapModalMode(existingSwap),
    shift: initialShift || 'DAY',
    type: existingSwap?.type || 'COVER',
    fromId: resolveInitialFromId(initialRepId, existingSwap),
    toId: resolveInitialToId(existingSwap),
    note: existingSwap?.note || '',
  }
}

export function resolveSwapTypeFromMode(nextMode: SwapModalMode): SwapType {
  return nextMode === 'COBERTURA' ? 'COVER' : nextMode
}
