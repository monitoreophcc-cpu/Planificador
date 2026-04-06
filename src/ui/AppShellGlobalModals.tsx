'use client'

import dynamic from 'next/dynamic'
import { useAppUiStore } from '@/store/useAppUiStore'

const ConfirmDialog = dynamic(
  () => import('./components/ConfirmDialog').then(mod => mod.ConfirmDialog)
)
const VacationConfirmation = dynamic(
  () =>
    import('./components/VacationConfirmation').then(
      mod => mod.VacationConfirmation
    )
)
const LazyPersonDetailModal = dynamic(
  () =>
    import('./monthly/LazyPersonDetailModal').then(
      mod => mod.LazyPersonDetailModal
    )
)
const MixedShiftConfirmModal = dynamic(
  () =>
    import('./planning/MixedShiftConfirmModal').then(
      mod => mod.MixedShiftConfirmModal
    )
)

export function AppShellGlobalModals() {
  const {
    confirmState,
    handleConfirm,
    detailModalState,
    closeDetailModal,
    mixedShiftConfirmModalState,
    handleMixedShiftConfirm,
    vacationConfirmationState,
    closeVacationConfirmation,
  } = useAppUiStore(s => ({
    confirmState: s.confirmState,
    handleConfirm: s.handleConfirm,
    detailModalState: s.detailModalState,
    closeDetailModal: s.closeDetailModal,
    mixedShiftConfirmModalState: s.mixedShiftConfirmModalState,
    handleMixedShiftConfirm: s.handleMixedShiftConfirm,
    vacationConfirmationState: s.vacationConfirmationState,
    closeVacationConfirmation: s.closeVacationConfirmation,
  }))

  return (
    <>
      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          title={confirmState.options.title}
          description={confirmState.options.description}
          intent={confirmState.options.intent}
          confirmLabel={confirmState.options.confirmLabel}
          cancelLabel={confirmState.options.cancelLabel}
          onConfirm={() => handleConfirm(true)}
          onCancel={() => handleConfirm(false)}
        />
      )}

      {vacationConfirmationState?.isOpen && (
        <VacationConfirmation
          isOpen={vacationConfirmationState.isOpen}
          repName={vacationConfirmationState.repName}
          startDate={vacationConfirmationState.startDate}
          endDate={vacationConfirmationState.endDate}
          returnDate={vacationConfirmationState.returnDate}
          workingDays={vacationConfirmationState.workingDays}
          onClose={closeVacationConfirmation}
        />
      )}

      {mixedShiftConfirmModalState?.isOpen && (
        <MixedShiftConfirmModal
          activeShift={mixedShiftConfirmModalState.activeShift}
          onClose={() => handleMixedShiftConfirm(null)}
          onSelect={handleMixedShiftConfirm}
        />
      )}

      {detailModalState.isOpen && detailModalState.personId && (
        <LazyPersonDetailModal
          month={detailModalState.month}
          personId={detailModalState.personId}
          onClose={closeDetailModal}
        />
      )}
    </>
  )
}
