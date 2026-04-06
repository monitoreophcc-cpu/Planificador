import type { ReactNode } from 'react'
import type {
  ISODate,
  Representative,
  ShiftType,
  SwapEvent,
  SwapType,
} from '@/domain/types'
import type { EffectiveSwapContext } from '@/domain/swaps/buildDailyEffectiveContext'
import { repName } from '@/application/presenters/humanize'

export type SwapModalMode = 'COBERTURA' | 'SWAP' | 'DOUBLE'

type BuildSwapPreviewTextParams = {
  mode: SwapModalMode
  type: SwapType
  canSubmit: boolean
  fromId: string
  toId: string
  shift: ShiftType
  effectiveShift: ShiftType
  validationContext: EffectiveSwapContext
  representatives: Representative[]
}

export function buildSwapPreviewText({
  mode,
  type,
  canSubmit,
  fromId,
  toId,
  shift,
  effectiveShift,
  validationContext,
  representatives,
}: BuildSwapPreviewTextParams): ReactNode | null {
  if (!canSubmit || (!fromId && type !== 'DOUBLE') || !toId) return null

  const fromName = repName(representatives, fromId)
  const toName = repName(representatives, toId)

  if (mode === 'COBERTURA') {
    const shiftName = effectiveShift === 'DAY' ? 'Dia' : 'Noche'
    return (
      <>
        <strong>{toName}</strong> cubrira el turno <strong>{shiftName}</strong>{' '}
        de <strong>{fromName}</strong>.
        <br />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Este cambio solo proyecta badges, no mueve personas entre turnos.
        </span>
      </>
    )
  }

  if (type === 'COVER') {
    const shiftName = effectiveShift === 'DAY' ? 'Dia' : 'Noche'
    return (
      <>
        <strong>{toName}</strong> cubrira el turno <strong>{shiftName}</strong>{' '}
        de <strong>{fromName}</strong>.
        <br />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Este cambio aplica para el dia seleccionado.
        </span>
      </>
    )
  }

  if (type === 'SWAP') {
    const fromShifts = validationContext.daily[fromId]?.effectiveShifts
    const toShifts = validationContext.daily[toId]?.effectiveShifts

    if (fromShifts && toShifts && fromShifts.size === 1 && toShifts.size === 1) {
      const fromShift = Array.from(fromShifts)[0]
      const toShift = Array.from(toShifts)[0]

      return (
        <>
          <strong>{fromName}</strong> (Turno {fromShift}) y{' '}
          <strong>{toName}</strong> (Turno {toShift}) intercambian sus turnos.
        </>
      )
    }

    return 'Intercambio de turnos.'
  }

  if (type === 'DOUBLE') {
    const shiftName = shift === 'DAY' ? 'Dia' : 'Noche'
    return (
      <>
        <strong>{toName}</strong> hara un turno DOBLE en{' '}
        <strong>{shiftName}</strong>.
        <br />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Se cuenta como +1 en la cobertura.
        </span>
      </>
    )
  }

  return null
}

export function describeExistingSwap(
  existingSwap: SwapEvent,
  representatives: Representative[]
): string {
  if (existingSwap.type === 'COVER') {
    const fromName = repName(representatives, existingSwap.fromRepresentativeId)
    const toName = repName(representatives, existingSwap.toRepresentativeId)
    const shiftName = existingSwap.shift === 'DAY' ? 'Dia' : 'Noche'
    return `${toName} esta cubriendo el turno ${shiftName} de ${fromName}`
  }

  if (existingSwap.type === 'DOUBLE') {
    const personName = repName(representatives, existingSwap.representativeId)
    const shiftName = existingSwap.shift === 'DAY' ? 'Dia' : 'Noche'
    return `${personName} tiene un turno doble en ${shiftName}`
  }

  if (existingSwap.type === 'SWAP') {
    const fromName = repName(representatives, existingSwap.fromRepresentativeId)
    const toName = repName(representatives, existingSwap.toRepresentativeId)
    return `${fromName} y ${toName} intercambiaron turnos`
  }

  return ''
}

export function resolveInitialSwapModalMode(
  existingSwap?: SwapEvent
): SwapModalMode {
  if (existingSwap?.type === 'SWAP') return 'SWAP'
  if (existingSwap?.type === 'DOUBLE') return 'DOUBLE'
  return 'COBERTURA'
}

export function isCoverageMode(mode: SwapModalMode): boolean {
  return mode === 'COBERTURA'
}

export function resolveInitialSwapModalDate(
  initialDate: ISODate | undefined,
  planningAnchorDate: ISODate
): ISODate {
  return initialDate || planningAnchorDate
}
