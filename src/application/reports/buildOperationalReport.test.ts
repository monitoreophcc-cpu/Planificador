'use client'

import { buildOperationalReport } from './buildOperationalReport'
import type { Incident, Representative } from '@/domain/types'

describe('buildOperationalReport', () => {
  const representatives: Representative[] = [
    {
      id: 'rep-day',
      name: 'Andrea Día',
      baseSchedule: { 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING' },
      baseShift: 'DAY',
      role: 'SALES',
      isActive: true,
      orderIndex: 0,
    },
    {
      id: 'rep-night',
      name: 'Nico Noche',
      baseSchedule: { 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING' },
      baseShift: 'NIGHT',
      role: 'CUSTOMER_SERVICE',
      isActive: true,
      orderIndex: 1,
    },
  ]

  const incidents: Incident[] = [
    {
      id: 'inc-1',
      representativeId: 'rep-day',
      type: 'AUSENCIA',
      startDate: '2026-04-03',
      duration: 1,
      createdAt: '2026-04-03T08:00:00.000Z',
    },
    {
      id: 'inc-2',
      representativeId: 'rep-day',
      type: 'TARDANZA',
      startDate: '2026-04-04',
      duration: 1,
      createdAt: '2026-04-04T08:00:00.000Z',
    },
    {
      id: 'inc-3',
      representativeId: 'rep-night',
      type: 'ERROR',
      startDate: '2026-04-05',
      duration: 1,
      createdAt: '2026-04-05T08:00:00.000Z',
    },
    {
      id: 'inc-4',
      representativeId: 'rep-night',
      type: 'LICENCIA',
      startDate: '2026-04-06',
      duration: 2,
      createdAt: '2026-04-06T08:00:00.000Z',
    },
    {
      id: 'inc-5',
      representativeId: 'rep-night',
      type: 'AUSENCIA',
      startDate: '2026-03-01',
      duration: 1,
      createdAt: '2026-03-01T08:00:00.000Z',
    },
  ]

  it('builds shift totals and incident type breakdowns for the current period', () => {
    const report = buildOperationalReport(
      representatives,
      incidents,
      'MONTH',
      new Date('2026-04-08T12:00:00.000Z')
    )

    expect(report.shifts.DAY).toEqual({
      incidents: 2,
      points: 9,
    })

    expect(report.shifts.NIGHT).toEqual({
      incidents: 1,
      points: 2,
    })

    expect(report.topIncidents[0]).toMatchObject({
      type: 'AUSENCIA',
      count: 1,
      points: 6,
    })

    expect(report.topIncidents.find(item => item.type === 'LICENCIA')).toMatchObject({
      type: 'LICENCIA',
      count: 1,
      points: 0,
    })
  })
})
