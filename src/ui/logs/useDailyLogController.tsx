'use client'

import { useDeferredValue, useEffect, useMemo } from 'react'
import { parseISO } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/ui/components/ToastProvider'
import { useDailyLogDerivedData } from './useDailyLogDerivedData'
import { useDailyLogFormState } from './useDailyLogFormState'
import { useDailyLogSubmission } from './useDailyLogSubmission'

export function useDailyLogController() {
  const { showToast } = useToast()
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
    removeIncidents,
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
    removeIncidents: state.removeIncidents,
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
  const deferredSearchTerm = useDeferredValue(formState.searchTerm)

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
    searchTerm: deferredSearchTerm,
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

  useEffect(() => {
    if (!formState.bulkMode) return

    const supportedBulkMode =
      incidentType === 'AUSENCIA' || incidentType === 'OTRO' ? incidentType : null

    if (supportedBulkMode !== formState.bulkMode) {
      formState.resetBulkRegistration()
    }
  }, [formState, incidentType])

  const { handleBulkSubmit, handleSubmit, onCoverageResolutionConfirm } =
    useDailyLogSubmission({
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
      removeIncidents,
      representatives,
      selectedRep,
      setAbsenceConfirmState: formState.setAbsenceConfirmState,
      setCoverageResolution: formState.setCoverageResolution,
      setCustomPoints: formState.setCustomPoints,
      setNote: formState.setNote,
      showConfirm,
      showToast,
    })

  const onSubmitBulkRegistration = async () => {
    if (!formState.bulkMode) {
      return
    }

    formState.setBulkError(null)
    formState.setIsBulkSubmitting(true)

    const result = await handleBulkSubmit({
      bulkMode: formState.bulkMode,
      bulkSelectedRepIds: formState.bulkSelectedRepIds,
      bulkNote: formState.bulkNote,
      bulkAbsenceJustified: formState.bulkAbsenceJustified,
      bulkCustomPoints: formState.bulkCustomPoints,
    })

    formState.setIsBulkSubmitting(false)

    if (result.ok) {
      formState.resetBulkRegistration()
      return
    }

    if (result.reason === 'Acción cancelada por el usuario.') {
      return
    }

    if (result.failures.length > 0) {
      formState.setBulkSelectedRepIds(result.failures.map(failure => failure.id))
      formState.setBulkError(
        `${result.reason} ${result.failures
          .slice(0, 3)
          .map(failure => `${failure.name}: ${failure.reason}`)
          .join(' · ')}${
          result.failures.length > 3 ? ' · ...' : ''
        }`
      )
      return
    }

    formState.setBulkError(result.reason)
  }

  return {
    ...derived,
    ...formState,
    allCalendarDaysForRelevantMonths,
    dateForLog,
    incidents,
    isLoading,
    logDate,
    representatives,
    handleBulkSubmit: onSubmitBulkRegistration,
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
