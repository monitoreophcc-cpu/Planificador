import {
  serializeCommercialGoals,
  serializeRepresentatives,
} from './supabase-sync-serializers'
import { deserializeCloudSnapshot } from './supabase-sync-deserializers'

describe('supabase sync commercial serialization', () => {
  it('round-trips representative commercial fields and commercial goals', () => {
    const representatives = [
      {
        id: 'rep-1',
        name: 'Ana Comercial',
        baseShift: 'DAY' as const,
        baseSchedule: {},
        role: 'SALES' as const,
        employmentType: 'PART_TIME' as const,
        commercialEligible: true,
        isActive: true,
        orderIndex: 0,
      },
    ]
    const commercialGoals = [
      {
        id: 'DAY:PART_TIME',
        shift: 'DAY' as const,
        segment: 'PART_TIME' as const,
        monthlyTarget: 320,
      },
      {
        id: 'NIGHT:FULL_TIME',
        shift: 'NIGHT' as const,
        segment: 'FULL_TIME' as const,
        monthlyTarget: 540,
      },
    ]

    const snapshot = deserializeCloudSnapshot({
      representativesRows: serializeRepresentatives(representatives, 'user-1'),
      commercialGoalsRows: serializeCommercialGoals(commercialGoals, 'user-1'),
      weeklyPlansRows: [],
      incidentsRows: [],
      swapsRows: [],
      coverageRulesRows: [],
    })

    expect(snapshot.representatives[0]).toMatchObject({
      id: 'rep-1',
      employmentType: 'PART_TIME',
      commercialEligible: true,
    })

    expect(snapshot.commercialGoals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'DAY:PART_TIME',
          monthlyTarget: 320,
        }),
        expect.objectContaining({
          id: 'NIGHT:FULL_TIME',
          monthlyTarget: 540,
        }),
      ])
    )
  })
})
