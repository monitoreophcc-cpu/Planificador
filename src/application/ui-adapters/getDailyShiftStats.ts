import { WeeklyPlan, Incident, ISODate, ShiftType, DayInfo, Representative, SpecialSchedule } from '@/domain/types'
import { isSlotOperationallyEmpty } from '@/domain/planning/isSlotOperationallyEmpty'
import { getPlannedAgentsForDay } from './getPlannedAgentsForDay'

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
    allCalendarDays: DayInfo[],
    representatives: Representative[],
    specialSchedules: SpecialSchedule[] = []
) {
    if (!weeklyPlan) {
        return { planned: 0, present: 0 }
    }

    const plannedSlots = getPlannedAgentsForDay(
        representatives,
        incidents,
        date,
        shift,
        allCalendarDays,
        specialSchedules
    )

    const presentSlots = plannedSlots.filter(agent =>
        !isSlotOperationallyEmpty(agent.representativeId, date, shift, incidents)
    )

    return {
        planned: plannedSlots.length,
        present: presentSlots.length,
    }
}
