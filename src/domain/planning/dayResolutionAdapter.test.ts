import { dayResolutionToDailyPresence } from './dayResolutionAdapter'
import type { DayResolution } from './dayResolution'

describe('dayResolutionToDailyPresence', () => {
  it('preserves override source when an override day also has ausencia reality', () => {
    const resolution: DayResolution = {
      plan: {
        assignment: { type: 'SINGLE', shift: 'DAY' },
        source: 'OVERRIDE',
      },
      reality: {
        status: 'WORKING',
        incidentType: 'AUSENCIA',
      },
      computed: {
        display: {
          appearsInPlanner: true,
          appearsInShifts: ['DAY'],
          badge: 'AUSENCIA',
        },
        metrics: {
          countsAsWorked: false,
          countsForIncentives: false,
          countsAsAbsence: true,
        },
      },
    }

    expect(dayResolutionToDailyPresence(resolution)).toEqual({
      status: 'WORKING',
      source: 'OVERRIDE',
      type: 'AUSENCIA',
      assignment: { type: 'SINGLE', shift: 'DAY' },
      badge: 'AUSENCIA',
      coverageContext: undefined,
    })
  })

  it('maps special-source planning back to legacy presence with coverage metadata', () => {
    const resolution: DayResolution = {
      plan: {
        assignment: { type: 'SINGLE', shift: 'NIGHT' },
        source: 'SPECIAL',
      },
      reality: {
        status: 'WORKING',
      },
      computed: {
        display: {
          appearsInPlanner: true,
          appearsInShifts: ['NIGHT'],
          badge: 'CUBRIENDO',
        },
        metrics: {
          countsAsWorked: true,
          countsForIncentives: true,
          countsAsAbsence: false,
        },
      },
    }

    expect(
      dayResolutionToDailyPresence(resolution, {
        isCovered: false,
        isCovering: true,
        covering: {
          repId: 'rep-covering',
          coverageId: 'coverage-1',
        },
      })
    ).toEqual({
      status: 'WORKING',
      source: 'BASE',
      type: undefined,
      assignment: { type: 'SINGLE', shift: 'NIGHT' },
      badge: 'CUBRIENDO',
      coverageContext: {
        coveredByRepId: undefined,
        coveringRepId: 'rep-covering',
      },
    })
  })
})
