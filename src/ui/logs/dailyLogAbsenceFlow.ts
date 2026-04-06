import type { ReactNode } from 'react'
import { resolveSlotResponsibility } from '@/domain/planning/resolveSlotResponsibility'
import type { Coverage } from '@/domain/planning/coverage'
import {
  isCoverageResponsibilityResolution,
  type CoverageResponsibilityResolution,
} from '@/domain/planning/slotResponsibility'
import type {
  ISODate,
  Representative,
  ShiftType,
  WeeklyPlan,
} from '@/domain/types'
import {
  initialAbsenceConfirmState,
  type AbsenceConfirmState,
} from './dailyLogControllerTypes'
import { buildAbsenceIncidentInput } from './dailyLogSubmissionHelpers'

type ShowConfirm = (options: {
  title: string
  description?: ReactNode
  intent?: 'danger' | 'warning' | 'info'
  confirmLabel?: string
  cancelLabel?: string
}) => Promise<boolean>

interface HandleDailyLogAbsenceSubmitParams {
  activeCoveragesForDay: Coverage[]
  activeShift: 'DAY' | 'NIGHT'
  activeWeeklyPlan: WeeklyPlan | null
  logDate: ISODate
  note: string
  representatives: Representative[]
  selectedRep: Representative | null
  setAbsenceConfirmState: (value: AbsenceConfirmState) => void
  setCoverageResolution: (
    value: CoverageResponsibilityResolution | null
  ) => void
  showConfirm: ShowConfirm
  submit: (
    input: ReturnType<typeof buildAbsenceIncidentInput>,
    representative: Representative
  ) => Promise<void>
}

export async function handleDailyLogAbsenceSubmit({
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
}: HandleDailyLogAbsenceSubmitParams) {
  if (!selectedRep) return

  if (!activeWeeklyPlan) {
    await showConfirm({
      title: 'Plan semanal no disponible',
      description:
        'No se pudo resolver la responsabilidad del slot para esta fecha.',
      intent: 'warning',
      confirmLabel: 'Entendido',
    })
    return
  }

  const resolution = resolveSlotResponsibility(
    selectedRep.id,
    logDate,
    activeShift,
    activeWeeklyPlan,
    activeCoveragesForDay,
    representatives
  )

  if (resolution.kind === 'UNASSIGNED') {
    await showConfirm({
      title: resolution.displayContext.title,
      description: resolution.displayContext.subtitle,
      intent: 'warning',
      confirmLabel: 'Entendido',
    })
    return
  }

  if (isCoverageResponsibilityResolution(resolution)) {
    setCoverageResolution(resolution)
    return
  }

  setAbsenceConfirmState({
    isOpen: true,
    rep: selectedRep,
    onConfirm: isJustified => {
      void submit(
        buildAbsenceIncidentInput({
          isJustified,
          logDate,
          note,
          resolution,
        }),
        selectedRep
      )
      setAbsenceConfirmState(initialAbsenceConfirmState)
    },
    onCancel: () => setAbsenceConfirmState(initialAbsenceConfirmState),
  })
}

export function handleDailyLogCoverageResolutionConfirm(args: {
  coverageResolution: CoverageResponsibilityResolution | null
  isJustified: boolean
  logDate: ISODate
  note: string
  representatives: Representative[]
  selectedRep: Representative | null
  setCoverageResolution: (
    value: CoverageResponsibilityResolution | null
  ) => void
  submit: (
    input: ReturnType<typeof buildAbsenceIncidentInput>,
    representative: Representative
  ) => Promise<void>
}) {
  const {
    coverageResolution,
    isJustified,
    logDate,
    note,
    representatives,
    selectedRep,
    setCoverageResolution,
    submit,
  } = args

  if (!selectedRep || !coverageResolution) return

  const targetRep = representatives.find(
    representative => representative.id === coverageResolution.targetRepId
  )

  if (targetRep) {
    void submit(
      buildAbsenceIncidentInput({
        isJustified,
        logDate,
        note,
        resolution: coverageResolution,
      }),
      targetRep
    )
  }

  setCoverageResolution(null)
}
