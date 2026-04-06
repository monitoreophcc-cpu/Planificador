'use client'

import { findCoverageForDay } from '@/domain/planning/coverage'
import type { Coverage } from '@/domain/planning/coverage'
import type { ISODate, Representative, ShiftType } from '@/domain/types'

export type CoverageLookup = ReturnType<typeof findCoverageForDay>

interface BuildCoverageByRepIdParams {
  activeCoveragesForDay: Coverage[]
  activeShift: ShiftType
  logDate: ISODate
  representatives: Representative[]
}

export function buildCoverageByRepId({
  activeCoveragesForDay,
  activeShift,
  logDate,
  representatives,
}: BuildCoverageByRepIdParams) {
  const map = new Map<string, CoverageLookup>()

  for (const representative of representatives) {
    map.set(
      representative.id,
      findCoverageForDay(
        representative.id,
        logDate,
        activeCoveragesForDay,
        activeShift
      )
    )
  }

  return map
}
