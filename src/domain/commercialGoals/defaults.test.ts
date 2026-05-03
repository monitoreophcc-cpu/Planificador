import {
  createDefaultCommercialGoals,
  normalizeCommercialGoals,
} from './defaults'

describe('normalizeCommercialGoals', () => {
  it('fills missing goal rows from legacy snapshots', () => {
    const normalized = normalizeCommercialGoals([
      {
        id: 'DAY:PART_TIME',
        shift: 'DAY',
        segment: 'PART_TIME',
        monthlyTarget: 120,
      },
    ])

    expect(normalized).toHaveLength(createDefaultCommercialGoals().length)
    expect(normalized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'DAY:PART_TIME',
          monthlyTarget: 120,
        }),
        expect.objectContaining({
          id: 'NIGHT:FULL_TIME',
          monthlyTarget: 0,
        }),
      ])
    )
  })
})
