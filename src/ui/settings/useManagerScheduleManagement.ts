'use client'

import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { calculateManagerLoad } from '@/domain/management/calculateManagerLoad'
import {
  analyzeManagerLoads,
  getMostLoadedManagerId,
} from './managerScheduleAnalysis'
import { getTodayIsoDate } from './managerScheduleManagementHelpers'
import { useManagerStructuralLog } from './useManagerStructuralLog'
import { useManagerScheduleDnd } from './useManagerScheduleDnd'
import { useManagerScheduleActions } from './useManagerScheduleActions'

export function useManagerScheduleManagement() {
  const {
    managers,
    managementSchedules,
    incidents,
    allCalendarDaysForRelevantMonths,
    representatives,
    addManager,
    removeManager,
    setManagerDuty,
    planningAnchorDate,
    setPlanningAnchorDate,
    copyManagerWeek,
    reorderManagers,
  } = useAppStore(state => ({
    managers: state.managers,
    managementSchedules: state.managementSchedules,
    incidents: state.incidents,
    allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    representatives: state.representatives,
    addManager: state.addManager,
    removeManager: state.removeManager,
    setManagerDuty: state.setManagerDuty,
    planningAnchorDate: state.planningAnchorDate,
    setPlanningAnchorDate: state.setPlanningAnchorDate,
    copyManagerWeek: state.copyManagerWeek,
    reorderManagers: state.reorderManagers,
  }))

  const { weekDays, label: weekLabel, handlePrevWeek, handleNextWeek } =
    useWeekNavigator(planningAnchorDate, setPlanningAnchorDate)

  useEffect(() => {
    setPlanningAnchorDate(getTodayIsoDate())
  }, [setPlanningAnchorDate])

  const isCurrentWeek = weekDays.some(day => day.date === getTodayIsoDate())

  const managerLoads = useMemo(
    () =>
      calculateManagerLoad(
        managers,
        managementSchedules,
        incidents,
        representatives,
        weekDays,
        allCalendarDaysForRelevantMonths
      ),
    [
      managers,
      managementSchedules,
      incidents,
      representatives,
      weekDays,
      allCalendarDaysForRelevantMonths,
    ]
  )

  const fairnessAnalysis = useMemo(
    () => analyzeManagerLoads(managerLoads),
    [managerLoads]
  )

  useManagerStructuralLog(fairnessAnalysis, planningAnchorDate)

  const mostLoadedManagerId = useMemo(
    () => getMostLoadedManagerId(managerLoads),
    [managerLoads]
  )

  const {
    handleCopyWeek,
    handleCreateManager,
    handleDutyChange,
    newManagerName,
    onGoToday,
    setNewManagerName,
  } = useManagerScheduleActions({
    addManager,
    copyManagerWeek,
    setManagerDuty,
    setPlanningAnchorDate,
    weekDays,
    weekLabel,
    onAdvanceWeek: handleNextWeek,
  })

  const { sensors, handleDragEnd } = useManagerScheduleDnd(
    managerLoads.map(manager => manager.id),
    reorderManagers
  )

  return {
    allCalendarDaysForRelevantMonths,
    handleCopyWeek,
    handleCreateManager,
    handleDragEnd,
    handleDutyChange,
    handleNextWeek,
    handlePrevWeek,
    incidents,
    isCurrentWeek,
    managementSchedules,
    managerLoads,
    managers,
    mostLoadedManagerId,
    newManagerName,
    onGoToday,
    removeManager,
    representatives,
    sensors,
    setNewManagerName,
    weekDays,
    weekLabel,
  }
}
