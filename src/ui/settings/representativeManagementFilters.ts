import type { Representative, RepresentativeRole } from '@/domain/types'

export type RepresentativeRoleFilter = 'ALL' | RepresentativeRole
export type RepresentativeStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export type RepresentativeFilters = {
  role: RepresentativeRoleFilter
  search: string
  status: RepresentativeStatusFilter
}

function normalizeSearchToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function representativeRoleLabel(role: RepresentativeRole): string {
  return role === 'CUSTOMER_SERVICE' ? 'servicio al cliente' : 'ventas'
}

function representativeShiftLabel(baseShift: Representative['baseShift']): string {
  return baseShift === 'DAY' ? 'dia' : 'noche'
}

export function matchesRepresentativeFilters(
  representative: Representative,
  filters: RepresentativeFilters
): boolean {
  if (
    filters.status === 'ACTIVE' &&
    representative.isActive === false
  ) {
    return false
  }

  if (
    filters.status === 'INACTIVE' &&
    representative.isActive !== false
  ) {
    return false
  }

  if (filters.role !== 'ALL' && representative.role !== filters.role) {
    return false
  }

  const normalizedSearch = normalizeSearchToken(filters.search)
  if (!normalizedSearch) {
    return true
  }

  const searchableText = normalizeSearchToken(
    [
      representative.name,
      representativeRoleLabel(representative.role),
      representativeShiftLabel(representative.baseShift),
      representative.isActive === false ? 'inactivo' : 'activo',
    ].join(' ')
  )

  return searchableText.includes(normalizedSearch)
}

export function filterRepresentatives(
  representatives: Representative[],
  filters: RepresentativeFilters
): Representative[] {
  return representatives.filter(representative =>
    matchesRepresentativeFilters(representative, filters)
  )
}

export function hasActiveRepresentativeFilters(
  filters: RepresentativeFilters
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.role !== 'ALL' ||
    filters.status !== 'ALL'
  )
}
