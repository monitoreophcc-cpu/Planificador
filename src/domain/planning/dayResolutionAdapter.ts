/**
 * 🔄 COMPATIBILITY ADAPTER
 * 
 * Supported bridge to convert DayResolution back to legacy DailyPresence
 * while WeeklyPlan consumers still depend on the older shape.
 */

import { DayResolution } from './dayResolution'
import { DailyPresence } from './types'
import { CoverageLookup } from './coverage'

export function dayResolutionToDailyPresence(
    res: DayResolution,
    coverage?: CoverageLookup
): Omit<DailyPresence, 'isModified'> {
    // Map source (DayPlan uses 'SPECIAL', DailyPresence uses 'BASE'/'OVERRIDE'/'INCIDENT'/'SWAP')
    let legacySource: DailyPresence['source'] = res.plan.source === 'SPECIAL' ? 'BASE' : res.plan.source

    // If reality has an incident, source becomes 'INCIDENT' for legacy consumers
    if (res.reality.incidentType) {
        legacySource = 'INCIDENT'
    }

    // Override source preservation (for audit trail)
    if (res.plan.source === 'OVERRIDE' && res.reality.incidentType === 'AUSENCIA') {
        legacySource = 'OVERRIDE' // Preserve override source even with absence
    }

    return {
        status: res.reality.status,
        source: legacySource,
        type: res.reality.incidentType,
        assignment: res.plan.assignment,
        badge: res.computed.display.badge, // 🔄 Pass badge from computed layer
        coverageContext: coverage ? { // 🔄 NEW: Pass coverage context for tooltips
            coveredByRepId: coverage.coveredBy?.repId,
            coveringRepId: coverage.covering?.repId
        } : undefined
    }
}
