import { WeeklyPlan, Incident, ISODate, ShiftType, DayInfo, Representative, SpecialSchedule } from '@/domain/types'
import { isSlotOperationallyEmpty } from '@/domain/planning/isSlotOperationallyEmpty'

function isPlannedForShift(day: unknown, shift: ShiftType): boolean {
    if (!day || typeof day !== 'object') {
        return false
    }

    const dayRecord = day as Record<string, unknown>
    const assignment = dayRecord.assignment

    if (assignment && typeof assignment === 'object') {
        const assignmentRecord = assignment as Record<string, unknown>

        if (assignmentRecord.type === 'BOTH') {
            return true
        }

        if (assignmentRecord.type === 'SINGLE' && assignmentRecord.shift === shift) {
            return true
        }

        if (assignmentRecord.type === 'NONE') {
            return false
        }
    }

    if (dayRecord.shift === shift || dayRecord.type === shift) {
        return true
    }

    return dayRecord.type === 'MIXTO'
}

/**
 * ⚠️ CANONICAL SOURCE OF TRUTH FOR DAILY SHIFT STATISTICS
 * 
 * This function defines the operational reality of the system.
 * DO NOT duplicate this logic in UI components, graphs, or reports.
 * 
 * All components that need planned/present counts MUST consume this function.
 * 
 * @returns { planned: number, present: number }
 * - planned: Agents scheduled to work (excludes LICENCIA/VACACIONES, includes AUSENCIA)
 * - present: Agents who actually showed up (planned - AUSENCIA)
 */
export function getDailyShiftStats(
    weeklyPlan: WeeklyPlan | null,
    incidents: Incident[],
    date: ISODate,
    shift: ShiftType,
    _allCalendarDays: DayInfo[],
    _representatives: Representative[],
    _specialSchedules: SpecialSchedule[] = []
) {
    if (!weeklyPlan) {
        return { planned: 0, present: 0 }
    }

    const plannedSlots = weeklyPlan.agents.filter(agent =>
        isPlannedForShift(agent.days[date], shift)
    )

    const presentSlots = plannedSlots.filter(agent =>
        !isSlotOperationallyEmpty(agent.representativeId, date, shift, incidents)
    )

    return {
        planned: plannedSlots.length,
        present: presentSlots.length,
    }
}
