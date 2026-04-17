import type { Representative } from '@/domain/types'
import { sortPlannerRepresentativesForShift } from './sortPlannerRepresentativesForShift'

function createRepresentative(
  overrides: Partial<Representative> & Pick<Representative, 'id' | 'name'>
): Representative {
  return {
    id: overrides.id,
    name: overrides.name,
    baseShift: overrides.baseShift ?? 'DAY',
    baseSchedule: overrides.baseSchedule ?? {},
    role: overrides.role ?? 'SALES',
    isActive: overrides.isActive ?? true,
    orderIndex: overrides.orderIndex ?? 0,
    mixProfile: overrides.mixProfile,
  }
}

describe('sortPlannerRepresentativesForShift', () => {
  it('orders same-shift representatives by orderIndex', () => {
    const representatives = [
      createRepresentative({
        id: 'rep-2',
        name: 'Vanessa',
        baseShift: 'DAY',
        orderIndex: 2,
      }),
      createRepresentative({
        id: 'rep-0',
        name: 'Luz',
        baseShift: 'DAY',
        orderIndex: 0,
      }),
      createRepresentative({
        id: 'rep-1',
        name: 'Kirsis',
        baseShift: 'DAY',
        orderIndex: 1,
      }),
    ]

    expect(
      sortPlannerRepresentativesForShift(representatives, 'DAY').map(
        representative => representative.id
      )
    ).toEqual(['rep-0', 'rep-1', 'rep-2'])
  })

  it('keeps native shift reps first and appends cross-visible reps consistently', () => {
    const representatives = [
      createRepresentative({
        id: 'night-1',
        name: 'Wanda',
        baseShift: 'NIGHT',
        orderIndex: 1,
      }),
      createRepresentative({
        id: 'day-1',
        name: 'Kirsis',
        baseShift: 'DAY',
        orderIndex: 1,
      }),
      createRepresentative({
        id: 'night-0',
        name: 'Nicole',
        baseShift: 'NIGHT',
        orderIndex: 0,
      }),
      createRepresentative({
        id: 'day-0',
        name: 'Luz',
        baseShift: 'DAY',
        orderIndex: 0,
      }),
    ]

    expect(
      sortPlannerRepresentativesForShift(representatives, 'DAY').map(
        representative => representative.id
      )
    ).toEqual(['day-0', 'day-1', 'night-0', 'night-1'])
  })
})
