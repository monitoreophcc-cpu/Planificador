import type { Representative } from '@/domain/types'
import {
  filterRepresentatives,
  hasActiveRepresentativeFilters,
  matchesRepresentativeFilters,
} from './representativeManagementFilters'

const representatives: Representative[] = [
  {
    id: 'rep-1',
    name: 'Ana García',
    role: 'SALES',
    baseShift: 'DAY',
    baseSchedule: {
      0: 'OFF',
      1: 'WORKING',
      2: 'WORKING',
      3: 'WORKING',
      4: 'WORKING',
      5: 'WORKING',
      6: 'WORKING',
    },
    orderIndex: 0,
    isActive: true,
  },
  {
    id: 'rep-2',
    name: 'Luis Torres',
    role: 'CUSTOMER_SERVICE',
    baseShift: 'NIGHT',
    baseSchedule: {
      0: 'WORKING',
      1: 'OFF',
      2: 'WORKING',
      3: 'WORKING',
      4: 'WORKING',
      5: 'WORKING',
      6: 'WORKING',
    },
    orderIndex: 1,
    isActive: false,
  },
]

describe('representativeManagementFilters', () => {
  it('matches search without accent sensitivity', () => {
    expect(
      matchesRepresentativeFilters(representatives[0], {
        search: 'garcia',
        role: 'ALL',
        status: 'ALL',
      })
    ).toBe(true)
  })

  it('filters by role and status together', () => {
    const filtered = filterRepresentatives(representatives, {
      search: '',
      role: 'CUSTOMER_SERVICE',
      status: 'INACTIVE',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('rep-2')
  })

  it('detects when filters are active', () => {
    expect(
      hasActiveRepresentativeFilters({
        search: '',
        role: 'ALL',
        status: 'ALL',
      })
    ).toBe(false)

    expect(
      hasActiveRepresentativeFilters({
        search: 'ana',
        role: 'ALL',
        status: 'ALL',
      })
    ).toBe(true)
  })
})
