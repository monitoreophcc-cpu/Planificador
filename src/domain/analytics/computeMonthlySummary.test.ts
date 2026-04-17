import { computeMonthlySummary } from './computeMonthlySummary'
import type { Incident, Representative } from '@/domain/types'

const representatives: Representative[] = [
  {
    id: 'r1',
    name: 'Ana',
    baseShift: 'DAY',
    role: 'SALES',
    isActive: true,
    orderIndex: 0,
    baseSchedule: { 1: 'WORKING' },
  },
]

describe('computeMonthlySummary risk thresholds', () => {
  it('marks the monthly status as ok below 5 points', () => {
    const incidents: Incident[] = [
      {
        id: 'i1',
        representativeId: 'r1',
        type: 'TARDANZA',
        startDate: '2025-01-06',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i2',
        representativeId: 'r1',
        type: 'ERROR',
        startDate: '2025-01-07',
        duration: 1,
        createdAt: '',
      },
    ]

    const summary = computeMonthlySummary(incidents, '2025-01', representatives)

    expect(summary.byPerson[0]?.totals.puntos).toBe(4)
    expect(summary.byPerson[0]?.riskLevel).toBe('ok')
  })

  it('marks the monthly status as warning between 5 and 10 points', () => {
    const incidents: Incident[] = [
      {
        id: 'i1',
        representativeId: 'r1',
        type: 'AUSENCIA',
        startDate: '2025-01-04',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i2',
        representativeId: 'r1',
        type: 'ERROR',
        startDate: '2025-01-07',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i3',
        representativeId: 'r1',
        type: 'TARDANZA',
        startDate: '2025-01-08',
        duration: 1,
        createdAt: '',
      },
    ]

    const summary = computeMonthlySummary(incidents, '2025-01', representatives)

    expect(summary.byPerson[0]?.totals.puntos).toBe(10)
    expect(summary.byPerson[0]?.riskLevel).toBe('warning')
  })

  it('marks the monthly status as danger only above 10 points', () => {
    const incidents: Incident[] = [
      {
        id: 'i1',
        representativeId: 'r1',
        type: 'TARDANZA',
        startDate: '2025-01-04',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i2',
        representativeId: 'r1',
        type: 'TARDANZA',
        startDate: '2025-01-05',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i3',
        representativeId: 'r1',
        type: 'AUSENCIA',
        startDate: '2025-01-06',
        duration: 1,
        createdAt: '',
      },
      {
        id: 'i4',
        representativeId: 'r1',
        type: 'ERROR',
        startDate: '2025-01-07',
        duration: 1,
        createdAt: '',
      },
    ]

    const summary = computeMonthlySummary(incidents, '2025-01', representatives)

    expect(summary.byPerson[0]?.totals.puntos).toBe(11)
    expect(summary.byPerson[0]?.riskLevel).toBe('danger')
  })
})
