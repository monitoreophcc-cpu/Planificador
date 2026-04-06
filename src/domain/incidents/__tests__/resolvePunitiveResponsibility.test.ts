import { resolvePunitiveResponsibility } from '../resolvePunitiveResponsibility'
import { DayInfo, Representative, WeeklyPlan, SwapEvent } from '@/domain/types'

const mockPlan: WeeklyPlan = {
    weekStart: '2026-01-05',
    agents: [
        {
            representativeId: 'A',
            days: { '2026-01-10': { status: 'WORKING', source: 'BASE', assignment: { type: 'SINGLE', shift: 'DAY' } } }
        },
        {
            representativeId: 'B',
            days: { '2026-01-10': { status: 'OFF', source: 'BASE', assignment: { type: 'NONE' } } }
        }
    ]
}

describe('resolvePunitiveResponsibility', () => {
    const date = '2026-01-10'
    const allCalendarDays: DayInfo[] = [
        { date, dayOfWeek: 6, kind: 'WORKING', isSpecial: false },
    ]
    const representatives: Representative[] = [
        {
            id: 'A',
            name: 'Agent A',
            role: 'SALES',
            isActive: true,
            baseShift: 'DAY',
            baseSchedule: { 6: 'WORKING' },
            orderIndex: 0,
        },
        {
            id: 'B',
            name: 'Agent B',
            role: 'SALES',
            isActive: true,
            baseShift: 'NIGHT',
            baseSchedule: { 6: 'WORKING' },
            orderIndex: 1,
        },
    ]

    it('punishes BASE worker normally', () => {
        // A works DAY. Not swapped. Should be punished if incident occurs (i.e. is responsible).
        const result = resolvePunitiveResponsibility(mockPlan, [], [], date, 'DAY', 'A', allCalendarDays, representatives)
        expect(result).toBe(true)
    })

    it('does NOT punish COVERED worker', () => {
        // A covered by B
        const swap: SwapEvent = {
            id: 's1', type: 'COVER', date, shift: 'DAY',
            fromRepresentativeId: 'A', toRepresentativeId: 'B',
            createdAt: ''
        }
        const result = resolvePunitiveResponsibility(mockPlan, [swap], [], date, 'DAY', 'A', allCalendarDays, representatives)
        expect(result).toBe(false)
    })

    it('punishes COVERING worker', () => {
        // B covers A
        const swap: SwapEvent = {
            id: 's1', type: 'COVER', date, shift: 'DAY',
            fromRepresentativeId: 'A', toRepresentativeId: 'B',
            createdAt: ''
        }
        const result = resolvePunitiveResponsibility(mockPlan, [swap], [], date, 'DAY', 'B', allCalendarDays, representatives)
        expect(result).toBe(true)
    })

    it('punishes SWAPPED_IN worker', () => {
        // A <-> B. A (Day) swaps with B (Night).
        // B should work DAY.
        const swap: SwapEvent = {
            id: 'x1', type: 'SWAP', date,
            fromRepresentativeId: 'A', fromShift: 'DAY',
            toRepresentativeId: 'B', toShift: 'NIGHT',
            createdAt: ''
        }
        const result = resolvePunitiveResponsibility(mockPlan, [swap], [], date, 'DAY', 'B', allCalendarDays, representatives)
        expect(result).toBe(true)
    })
})
