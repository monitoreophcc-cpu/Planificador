import { evaluateAnnualVacationLimit } from '../../../src/domain/incidents/evaluateAnnualVacationLimit'
import type { Incident } from '../../../src/domain/types'

describe('evaluateAnnualVacationLimit', () => {
  const baseIncidents: Incident[] = [
    {
      id: 'vac-1',
      representativeId: 'rep-1',
      type: 'VACACIONES',
      startDate: '2026-01-10',
      duration: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'vac-2',
      representativeId: 'rep-1',
      type: 'VACACIONES',
      startDate: '2026-03-10',
      duration: 4,
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'vac-other-year',
      representativeId: 'rep-1',
      type: 'VACACIONES',
      startDate: '2025-12-20',
      duration: 10,
      createdAt: '2025-12-01T00:00:00.000Z',
    },
    {
      id: 'vac-other-rep',
      representativeId: 'rep-2',
      type: 'VACACIONES',
      startDate: '2026-02-01',
      duration: 12,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ]

  it('returns ok when the request stays below the annual limit', () => {
    expect(
      evaluateAnnualVacationLimit({
        incidents: baseIncidents,
        representativeId: 'rep-1',
        startDate: '2026-04-10',
        requestedDays: 3,
      })
    ).toEqual({
      status: 'ok',
      year: 2026,
      limit: 14,
      usedDays: 9,
      requestedDays: 3,
      projectedDays: 12,
    })
  })

  it('returns warning when the request lands exactly on the annual limit', () => {
    const result = evaluateAnnualVacationLimit({
      incidents: baseIncidents,
      representativeId: 'rep-1',
      startDate: '2026-04-10',
      requestedDays: 5,
    })

    expect(result.status).toBe('warning')
    expect(result.projectedDays).toBe(14)
    expect(result.message).toContain('límite anual de 14 días')
  })

  it('returns excess when the request exceeds the annual limit for the target year', () => {
    const result = evaluateAnnualVacationLimit({
      incidents: baseIncidents,
      representativeId: 'rep-1',
      startDate: '2026-04-10',
      requestedDays: 6,
    })

    expect(result.status).toBe('excess')
    expect(result.usedDays).toBe(9)
    expect(result.projectedDays).toBe(15)
  })
})
