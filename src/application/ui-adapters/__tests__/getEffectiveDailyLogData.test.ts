import { getEffectiveDailyLogData } from '../getEffectiveDailyLogData'
import { WeeklyPlan, SwapEvent, Incident, DayInfo, Representative } from '@/domain/types'

const mockPlan: WeeklyPlan = {
    weekStart: '2026-01-05',
    agents: [
        {
            representativeId: 'A',
            days: { '2026-01-08': { status: 'WORKING', source: 'BASE', assignment: { type: 'SINGLE', shift: 'DAY' } } }
        },
        {
            representativeId: 'B',
            days: { '2026-01-08': { status: 'OFF', source: 'BASE', assignment: { type: 'NONE' } } }
        }
    ]
}

const mockCalendarDays: DayInfo[] = [
    { date: '2026-01-08', dayOfWeek: 4, isSpecial: false, kind: 'WORKING' }
]

const mockRepresentatives: Representative[] = [
    {
        id: 'A', name: 'Agent A', role: 'SALES', isActive: true, orderIndex: 0, baseShift: 'DAY',
        baseSchedule: { 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING', 6: 'OFF', 0: 'OFF' }
    },
    {
        id: 'B', name: 'Agent B', role: 'SALES', isActive: true, orderIndex: 1, baseShift: 'NIGHT',
        baseSchedule: { 1: 'WORKING', 2: 'WORKING', 3: 'WORKING', 4: 'WORKING', 5: 'WORKING', 6: 'OFF', 0: 'OFF' }
    }
]

describe('getEffectiveDailyLogData', () => {
    const date = '2026-01-08'  // Thursday

    it('identifies WORKING status', () => {
        const res = getEffectiveDailyLogData(mockPlan, [], [], date, mockCalendarDays, mockRepresentatives)
        const agentA_Day = res.find(e => e.representativeId === 'A' && e.shift === 'DAY')
        expect(agentA_Day?.logStatus).toBe('WORKING')
        expect(agentA_Day?.isResponsible).toBe(true)
    })

    it('identifies COVERING and COVERED status', () => {
        const swap: SwapEvent = {
            id: 's1', type: 'COVER', date, shift: 'DAY',
            fromRepresentativeId: 'A', toRepresentativeId: 'B', createdAt: ''
        }
        const res = getEffectiveDailyLogData(mockPlan, [swap], [], date, mockCalendarDays, mockRepresentatives)

        const agentA = res.find(e => e.representativeId === 'A' && e.shift === 'DAY')
        const agentB = res.find(e => e.representativeId === 'B' && e.shift === 'DAY')

        expect(agentA?.logStatus).toBe('COVERED')
        expect(agentA?.isResponsible).toBe(false)

        expect(agentB?.logStatus).toBe('COVERING')
        expect(agentB?.isResponsible).toBe(true)
    })

    it('identifies ABSENT status for formal incidents without changing the visible log semantics', () => {
        const vacation: Incident = {
            id: 'i1', type: 'VACACIONES', startDate: date, representativeId: 'A',
            createdAt: '', duration: 1
        }
        const license: Incident = {
            id: 'i2', type: 'LICENCIA', startDate: date, representativeId: 'A',
            createdAt: '', duration: 1
        }

        const vacationResult = getEffectiveDailyLogData(mockPlan, [], [vacation], date, mockCalendarDays, mockRepresentatives)
        const licenseResult = getEffectiveDailyLogData(mockPlan, [], [license], date, mockCalendarDays, mockRepresentatives)

        const vacationEntry = vacationResult.find(e => e.representativeId === 'A' && e.shift === 'DAY')
        const licenseEntry = licenseResult.find(e => e.representativeId === 'A' && e.shift === 'DAY')

        expect(vacationEntry?.logStatus).toBe('ABSENT')
        expect(vacationEntry?.details).toBe('VACACIONES')
        expect(vacationEntry?.isResponsible).toBe(false)

        expect(licenseEntry?.logStatus).toBe('ABSENT')
        expect(licenseEntry?.details).toBe('LICENCIA')
        expect(licenseEntry?.isResponsible).toBe(false)
    })
})
