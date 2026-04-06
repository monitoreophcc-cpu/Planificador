'use client'

import type { Representative, ISODate } from '@/domain/types'
import type { CoverageResponsibilityResolution } from '@/domain/planning/slotResponsibility'
import { AbsenceConfirmationModal } from './AbsenceConfirmationModal'
import { CoverageAbsenceModal } from './CoverageAbsenceModal'
import { CoverageManagerModal } from '../planning/coverage/CoverageManagerModal'

interface DailyLogModalsProps {
  absenceConfirmState: {
    isOpen: boolean
    rep: Representative | null
    onConfirm: (isJustified: boolean) => void
    onCancel: () => void
  }
  coverageResolution: CoverageResponsibilityResolution | null
  isCoverageManagerOpen: boolean
  logDate: ISODate
  onCloseCoverageManager: () => void
  onCloseCoverageResolution: () => void
  onConfirmCoverageResolution: (isJustified: boolean) => void
}

export function DailyLogModals({
  absenceConfirmState,
  coverageResolution,
  isCoverageManagerOpen,
  logDate,
  onCloseCoverageManager,
  onCloseCoverageResolution,
  onConfirmCoverageResolution,
}: DailyLogModalsProps) {
  return (
    <>
      {absenceConfirmState.isOpen && absenceConfirmState.rep && (
        <AbsenceConfirmationModal
          representativeName={absenceConfirmState.rep.name}
          onConfirm={absenceConfirmState.onConfirm}
          onCancel={absenceConfirmState.onCancel}
        />
      )}

      {coverageResolution && (
        <CoverageAbsenceModal
          resolution={coverageResolution}
          onConfirm={onConfirmCoverageResolution}
          onCancel={onCloseCoverageResolution}
        />
      )}

      <CoverageManagerModal
        isOpen={isCoverageManagerOpen}
        onClose={onCloseCoverageManager}
        date={logDate}
      />
    </>
  )
}
