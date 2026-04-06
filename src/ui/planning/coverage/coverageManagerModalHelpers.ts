import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Representative } from '@/domain/types'

export function formatCoverageManagerDate(date: string) {
  try {
    return format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })
  } catch {
    return date
  }
}

export function buildRepresentativeNameMap(representatives: Representative[]) {
  return new Map(representatives.map(representative => [representative.id, representative.name]))
}
