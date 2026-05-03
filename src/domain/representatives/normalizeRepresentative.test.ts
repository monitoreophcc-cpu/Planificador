import { normalizeRepresentativeRecord } from './normalizeRepresentative'

describe('normalizeRepresentativeRecord', () => {
  it('applies commercial defaults for legacy representatives', () => {
    const normalized = normalizeRepresentativeRecord({
      id: 'rep-1',
      name: 'Ana Legacy',
      baseSchedule: {},
      baseShift: 'DAY',
      role: 'SALES',
      isActive: true,
      orderIndex: 0,
    })

    expect(normalized.employmentType).toBeUndefined()
    expect(normalized.commercialEligible).toBe(false)
  })
})
