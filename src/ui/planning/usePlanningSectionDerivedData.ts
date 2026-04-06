'use client'

import { useMemo } from 'react'
import { getEffectiveAssignmentsForPlanner } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { getEffectiveDailyCoverage } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { belongsToShiftThisWeek } from './belongsToShiftThisWeek'
import type {
  CoverageRule,
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'

interface UsePlanningSectionDerivedDataParams {
  activeShift: ShiftType
  allCalendarDaysForRelevantMonths: DayInfo[]
  coverageRules: CoverageRule[]
  incidents: Incident[]
  representatives: Representative[]
  specialSchedules: SpecialSchedule[]
  swaps: SwapEvent[]
  weekDays: DayInfo[]
  weeklyPlan: WeeklyPlan | null
}

export function usePlanningSectionDerivedData({
  activeShift,
  allCalendarDaysForRelevantMonths,
  coverageRules,
  incidents,
  representatives,
  specialSchedules,
  swaps,
  weekDays,
  weeklyPlan,
}: UsePlanningSectionDerivedDataParams) {
  const activeRepresentatives = useMemo(
    () => representatives.filter(rep => rep.isActive !== false),
    [representatives]
  )

  const assignmentsMap = useMemo(() => {
    if (!weeklyPlan) {
      return {}
    }

    return getEffectiveAssignmentsForPlanner(
      weeklyPlan,
      swaps,
      incidents,
      allCalendarDaysForRelevantMonths,
      representatives,
      specialSchedules
    )
  }, [
    weeklyPlan,
    swaps,
    incidents,
    allCalendarDaysForRelevantMonths,
    representatives,
    specialSchedules,
  ])

  const agentsToRender = useMemo(() => {
    if (!weeklyPlan) {
      return []
    }

    const planMap = new Map(
      weeklyPlan.agents.map(agent => [agent.representativeId, agent])
    )

    return activeRepresentatives.filter(representative => {
      const agentPlan = planMap.get(representative.id)
      if (!agentPlan) {
        return false
      }

      return belongsToShiftThisWeek(
        agentPlan,
        weekDays,
        activeShift,
        representative,
        specialSchedules
      )
    })
  }, [
    weeklyPlan,
    weekDays,
    activeShift,
    activeRepresentatives,
    specialSchedules,
  ])

  const coverageData = useMemo(() => {
    if (!weeklyPlan) {
      return {} as Record<ISODate, EffectiveCoverageResult>
    }

    const data: Record<ISODate, EffectiveCoverageResult> = {}

    weekDays.forEach(day => {
      const result = getEffectiveDailyCoverage(
        weeklyPlan,
        swaps,
        coverageRules,
        day.date,
        incidents,
        allCalendarDaysForRelevantMonths,
        representatives,
        specialSchedules
      )

      data[day.date] = result[activeShift]
    })

    return data
  }, [
    weeklyPlan,
    swaps,
    coverageRules,
    weekDays,
    activeShift,
    incidents,
    allCalendarDaysForRelevantMonths,
    representatives,
    specialSchedules,
  ])

  return {
    assignmentsMap,
    agentsToRender,
    coverageData,
  }
}
