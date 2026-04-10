import type { IncidentType, Representative, SwapEvent } from '@/domain/types'

export function incidentLabel(type: IncidentType): string {
  switch (type) {
    case 'TARDANZA':
      return 'Tardanza'
    case 'AUSENCIA':
      return 'Ausencia'
    case 'ERROR':
      return 'Error'
    case 'OTRO':
      return 'Otro'
    case 'VACACIONES':
      return 'Vacaciones'
    case 'LICENCIA':
      return 'Licencia'
    case 'OVERRIDE':
      return 'Cambio de turno'
    case 'SWAP':
      return 'Intercambio'
    default:
      return 'Incidencia'
  }
}

export function repName(
  representatives: Representative[],
  id?: string | null
): string {
  if (!id) return '—'
  return representatives.find(r => r.id === id)?.name ?? '—'
}

export function swapDescription(
  swap: SwapEvent,
  representatives: Representative[]
): string {
  const getName = (id?: string) =>
    representatives.find(r => r.id === id)?.name ?? '—'

  switch (swap.type) {
    case 'COVER':
      return `${getName(swap.toRepresentativeId)} cubre a ${getName(
        swap.fromRepresentativeId
      )}`
    case 'DOUBLE':
      return `${getName(swap.representativeId)} realiza doble turno`
    case 'SWAP':
      return `${getName(swap.fromRepresentativeId)} intercambia turno con ${getName(
        swap.toRepresentativeId
      )}`
    default:
      return 'Movimiento de turno registrado'
  }
}
