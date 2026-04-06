'use client'

import type {
  Incident,
  ISODate,
  ShiftAssignment,
  ShiftType,
  SwapEvent,
} from '@/domain/types'

export type PromptConfig = {
  open: boolean
  title: string
  description: string
  placeholder?: string
  optional?: boolean
  resolve: (value: string | undefined) => void
}

export type SwapModalState = {
  isOpen: boolean
  repId: string | null
  date: ISODate | null
  shift: ShiftType | null
  existingSwap: SwapEvent | null
}

export type OverrideIncident = Incident & {
  previousAssignment?: ShiftAssignment
}

export function createClosedSwapModalState(): SwapModalState {
  return {
    isOpen: false,
    repId: null,
    date: null,
    shift: null,
    existingSwap: null,
  }
}

export function isRepresentativeInvolvedInSwap(
  swap: SwapEvent,
  representativeId: string
) {
  return (
    ('representativeId' in swap && swap.representativeId === representativeId) ||
    ('fromRepresentativeId' in swap &&
      swap.fromRepresentativeId === representativeId) ||
    ('toRepresentativeId' in swap && swap.toRepresentativeId === representativeId)
  )
}
