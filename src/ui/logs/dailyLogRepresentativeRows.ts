'use client'

import { isSlotOperationallyEmpty } from '@/domain/planning/isSlotOperationallyEmpty'
import { resolveSlotResponsibility } from '@/domain/planning/resolveSlotResponsibility'
import type { Coverage } from '@/domain/planning/coverage'
import type {
  Incident,
  ISODate,
  Representative,
  ShiftType,
  WeeklyPlan,
} from '@/domain/types'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import type { CoverageLookup } from './dailyLogCoverageMap'

interface BuildRepresentativeRowsParams {
  activeCoveragesForDay: Coverage[]
  activeShift: ShiftType
  activeWeeklyPlan: WeeklyPlan | null
  coverageByRepId: Map<string, CoverageLookup>
  filteredRepresentatives: Representative[]
  incidents: Incident[]
  logDate: ISODate
  representatives: Representative[]
}

export function buildRepresentativeRows({
  activeCoveragesForDay,
  activeShift,
  activeWeeklyPlan,
  coverageByRepId,
  filteredRepresentatives,
  incidents,
  logDate,
  representatives,
}: BuildRepresentativeRowsParams): DailyLogRepresentativeRow[] {
  const representativeById = new Map(
    representatives.map(representative => [representative.id, representative])
  )

  return filteredRepresentatives.map(representative => {
    const isOperationallyAbsent = isSlotOperationallyEmpty(
      representative.id,
      logDate,
      activeShift,
      incidents
    )

    const isAbsent = incidents.some(
      incident =>
        incident.representativeId === representative.id &&
        incident.type === 'AUSENCIA' &&
        incident.startDate === logDate
    )

    const resolution = activeWeeklyPlan
      ? resolveSlotResponsibility(
          representative.id,
          logDate,
          activeShift,
          activeWeeklyPlan,
          activeCoveragesForDay,
          representatives
        )
      : null

    const isUnassigned = resolution?.kind === 'UNASSIGNED'
    const isCovered =
      resolution?.kind === 'RESOLVED' && resolution.source === 'COVERAGE'

    const coverage = coverageByRepId.get(representative.id)
    const isCovering = coverage?.isCovering ?? false
    const coveringName = coverage?.covering?.repId
      ? representativeById.get(coverage.covering.repId)?.name
      : undefined

    return {
      id: representative.id,
      name: representative.name,
      isOperationallyAbsent,
      isAbsent,
      isUnassigned,
      isCovered,
      coveredByName:
        isCovered && resolution?.kind === 'RESOLVED'
          ? resolution.displayContext.targetName
          : undefined,
      isCovering,
      coveringName,
    }
  })
}
