import type {
  EffectiveDutyResult,
} from './resolveEffectiveDuty'
import type { ShiftType, SwapEvent } from '../types'

function applyCoverSwap(args: {
  representativeId: string
  shift: ShiftType
  swap: SwapEvent
}): EffectiveDutyResult | null {
  const { representativeId, shift, swap } = args

  if (swap.type !== 'COVER' || swap.shift !== shift) return null

  if (swap.fromRepresentativeId === representativeId) {
    return {
      shouldWork: false,
      role: 'COVERED',
      reason: `Cubierto por ${swap.toRepresentativeId}`,
      source: 'SWAP',
    }
  }

  if (swap.toRepresentativeId === representativeId) {
    return {
      shouldWork: true,
      role: 'COVERING',
      reason: `Cubriendo a ${swap.fromRepresentativeId}`,
      source: 'SWAP',
    }
  }

  return null
}

function applyDoubleSwap(args: {
  representativeId: string
  shift: ShiftType
  swap: SwapEvent
}): EffectiveDutyResult | null {
  const { representativeId, shift, swap } = args

  if (swap.type !== 'DOUBLE' || swap.shift !== shift) return null
  if (swap.representativeId !== representativeId) return null

  return {
    shouldWork: true,
    role: 'DOUBLE',
    reason: 'Turno adicional',
    source: 'SWAP',
  }
}

function applyExchangeSwap(args: {
  representativeId: string
  shift: ShiftType
  swap: SwapEvent
}): EffectiveDutyResult | null {
  const { representativeId, shift, swap } = args

  if (swap.type !== 'SWAP') return null

  if (swap.fromRepresentativeId === representativeId) {
    if (swap.fromShift === shift) {
      return {
        shouldWork: false,
        role: 'SWAPPED_OUT',
        reason: `Intercambio con ${swap.toRepresentativeId}`,
        source: 'SWAP',
      }
    }

    if (swap.toShift === shift) {
      return {
        shouldWork: true,
        role: 'SWAPPED_IN',
        reason: `Intercambio con ${swap.toRepresentativeId}`,
        source: 'SWAP',
      }
    }
  }

  if (swap.toRepresentativeId === representativeId) {
    if (swap.toShift === shift) {
      return {
        shouldWork: false,
        role: 'SWAPPED_OUT',
        reason: `Intercambio con ${swap.fromRepresentativeId}`,
        source: 'SWAP',
      }
    }

    if (swap.fromShift === shift) {
      return {
        shouldWork: true,
        role: 'SWAPPED_IN',
        reason: `Intercambio con ${swap.fromRepresentativeId}`,
        source: 'SWAP',
      }
    }
  }

  return null
}

export function applySwapEffect(args: {
  representativeId: string
  shift: ShiftType
  swap: SwapEvent
}): EffectiveDutyResult | null {
  return (
    applyCoverSwap(args) ??
    applyDoubleSwap(args) ??
    applyExchangeSwap(args)
  )
}
