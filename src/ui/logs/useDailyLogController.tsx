'use client'

import { useEffect, useMemo } from 'react'
import { parseISO } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { useDailyLogDerivedData } from './useDailyLogDerivedData'
import { initialAbsenceConfirmState } from './dailyLogControllerTypes'
import { useDailyLogFormState } from './useDailyLogFormState'
import { useDailyLogSubmission } from './useDailyLogSubmission'

export function useDailyLogController() {
  const {
    representatives,
    incidents,
    specialSchedules,
    allCalendarDaysForRelevantMonths,
    isLoading,
    addIncident,
    showConfirm,
    pushUndo,
    removeIncident,
    dailyLogDate,
    setDailyLogDate,
  } = useAppStore(state => ({
    representatives: state.representatives,
    incidents: state.incidents,
    specialSchedules: state.specialSchedules,
    allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    isLoading: state.isLoading,
    addIncident: state.addIncident,
    showConfirm: state.showConfirm,
    pushUndo: state.pushUndo,
    removeIncident: state.removeIncident,
    dailyLogDate: state.dailyLogDate,
    setDailyLogDate: state.setDailyLogDate,
  }))

  const logDate = dailyLogDate
  const formState = useDailyLogFormState()
  const {
    incidentType,
    selectedRep,
    setSearchTerm,
    setSelectedRep,
  } = formState

  const dateForLog = useMemo(() => parseISO(logDate), [logDate])

  const derived = useDailyLogDerivedData({
    activeShift: formState.activeShift,
    allCalendarDaysForRelevantMonths,
    dateForLog,
    duration: formState.duration,
    filterMode: formState.filterMode,
    hideAbsent: formState.hideAbsent,
    incidentType,
    incidents,
    isLoading,
    logDate,
    representatives,
    searchTerm: formState.searchTerm,
    selectedRep,
    specialSchedules,
  })

  useEffect(() => {
    if (!selectedRep) return

    const stillVisible = derived.baseRepresentativeList.some(
      representative => representative.id === selectedRep.id
    )

    if (!stillVisible) {
      setSelectedRep(null)
      setSearchTerm('')
    }
  }, [
    derived.baseRepresentativeList,
    incidentType,
    selectedRep,
    setSearchTerm,
    setSelectedRep,
  ])

  const { handleSubmit, onCoverageResolutionConfirm } = useDailyLogSubmission({
    activeCoveragesForDay: derived.activeCoveragesForDay,
    activeShift: formState.activeShift,
    activeWeeklyPlan: derived.activeWeeklyPlan,
    addIncident,
    allCalendarDaysForRelevantMonths,
    customPoints: formState.customPoints,
    duration: formState.duration,
    incidentType,
    incidents,
    logDate,
    note: formState.note,
    pushUndo,
    removeIncident,
    representatives,
    selectedRep,
    setAbsenceConfirmState: formState.setAbsenceConfirmState,
    setCoverageResolution: formState.setCoverageResolution,
    setCustomPoints: formState.setCustomPoints,
    setNote: formState.setNote,
    showConfirm,
  })

  return {
    ...derived,
    ...formState,
    allCalendarDaysForRelevantMonths,
    dateForLog,
    isLoading,
    logDate,
    representatives,
    handleSubmit,
    onCoverageResolutionConfirm: (isJustified: boolean) =>
      onCoverageResolutionConfirm(isJustified, formState.coverageResolution),
    onSelectRepresentative: (representativeId: string) => {
      const representative = representatives.find(
        candidate => candidate.id === representativeId
      )

      if (representative) {
        formState.setSelectedRep(representative)
      }
    },
    setLogDate: setDailyLogDate,
    setAbsenceConfirmState: formState.setAbsenceConfirmState,
    setCoverageResolution: formState.setCoverageResolution,
  }
}
