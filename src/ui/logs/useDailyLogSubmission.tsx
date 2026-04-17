'use client'

import type { FormEvent } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  IncidentType,
  ISODate,
  Representative,
  WeeklyPlan,
} from '@/domain/types'
import {
  type CoverageResponsibilityResolution,
} from '@/domain/planning/slotResponsibility'
import type { Coverage } from '@/domain/planning/coverage'
import {
  type AbsenceConfirmState,
} from './dailyLogControllerTypes'
import {
  handleDailyLogAbsenceSubmit,
  handleDailyLogCoverageResolutionConfirm,
} from './dailyLogAbsenceFlow'
import {
  submitDailyLogIncident,
  submitDailyLogIncidentBatch,
} from './dailyLogSubmissionHelpers'
import type { DailyLogBulkMode } from './dailyLogTypes'

interface UseDailyLogSubmissionParams {
  activeCoveragesForDay: Coverage[]
  activeShift: 'DAY' | 'NIGHT'
  activeWeeklyPlan: WeeklyPlan | null
  addIncident: (
    data: IncidentInput,
    skipConfirm?: boolean
  ) => Promise<{ ok: true; newId: string } | { ok: false; reason: string }>
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  logDate: ISODate
  note: string
  customPoints: number | ''
  duration: number
  incidentType: IncidentType
  pushUndo: (
    action: { label: string; undo: () => void },
    timeoutMs?: number
  ) => void
  removeIncident: (id: string, silent?: boolean) => void
  removeIncidents: (ids: string[]) => void
  representatives: Representative[]
  selectedRep: Representative | null
  setAbsenceConfirmState: (value: AbsenceConfirmState) => void
  setCoverageResolution: (
    value: CoverageResponsibilityResolution | null
  ) => void
  setCustomPoints: (value: number | '') => void
  setNote: (value: string) => void
  showConfirm: (options: {
    title: string
    description?: React.ReactNode
    intent?: 'danger' | 'warning' | 'info'
    confirmLabel?: string
    cancelLabel?: string
  }) => Promise<boolean>
  showToast: (options: {
    title: string
    message: string
    type?: 'success' | 'error' | 'info' | 'warning'
  }) => void
}

export function useDailyLogSubmission({
  activeCoveragesForDay,
  activeShift,
  activeWeeklyPlan,
  addIncident,
  allCalendarDaysForRelevantMonths,
  customPoints,
  duration,
  incidentType,
  incidents,
  logDate,
  note,
  pushUndo,
  removeIncident,
  removeIncidents,
  representatives,
  selectedRep,
  setAbsenceConfirmState,
  setCoverageResolution,
  setCustomPoints,
  setNote,
  showConfirm,
  showToast,
}: UseDailyLogSubmissionParams) {
  const submit = async (input: IncidentInput, representative: Representative) => {
    await submitDailyLogIncident({
      addIncident,
      allCalendarDaysForRelevantMonths,
      incidents,
      input,
      pushUndo,
      removeIncident,
      representative,
      setCustomPoints,
      setNote,
      showConfirm,
      showToast,
    })
  }

  const handleAbsenceSubmit = async () => {
    await handleDailyLogAbsenceSubmit({
      activeCoveragesForDay,
      activeShift,
      activeWeeklyPlan,
      logDate,
      note,
      representatives,
      selectedRep,
      setAbsenceConfirmState,
      setCoverageResolution,
      showConfirm,
      submit,
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedRep) return

    if (incidentType === 'AUSENCIA') {
      await handleAbsenceSubmit()
      return
    }

    const isMultiDay =
      incidentType === 'LICENCIA' || incidentType === 'VACACIONES'

    await submit(
      {
        representativeId: selectedRep.id,
        type: incidentType,
        startDate: logDate,
        duration: isMultiDay ? duration : 1,
        customPoints:
          incidentType === 'OTRO' && customPoints !== ''
            ? Number(customPoints)
            : undefined,
        note: note.trim() || undefined,
      },
      selectedRep
    )
  }

  const onCoverageResolutionConfirm = (
    isJustified: boolean,
    coverageResolution: CoverageResponsibilityResolution | null
  ) => {
    handleDailyLogCoverageResolutionConfirm({
      coverageResolution,
      isJustified,
      logDate,
      note,
      representatives,
      selectedRep,
      setCoverageResolution,
      submit: async () => undefined,
    })
  }

  const handleBulkSubmit = async (args: {
    bulkMode: DailyLogBulkMode
    bulkSelectedRepIds: string[]
    bulkNote: string
    bulkAbsenceJustified: boolean
    bulkCustomPoints: number
  }) =>
    submitDailyLogIncidentBatch({
      addIncident,
      bulkAbsenceJustified: args.bulkAbsenceJustified,
      bulkCustomPoints: args.bulkCustomPoints,
      bulkMode: args.bulkMode,
      bulkNote: args.bulkNote,
      bulkSelectedRepIds: args.bulkSelectedRepIds,
      logDate,
      pushUndo,
      removeIncidents,
      representatives,
      showConfirm,
    })

  return {
    handleBulkSubmit,
    handleSubmit,
    onCoverageResolutionConfirm,
  }
}
