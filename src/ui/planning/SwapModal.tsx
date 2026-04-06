import type { ShiftType } from '@/domain/types'
import { repName } from '@/application/presenters/humanize'
import { SwapModalView } from './SwapModalView'
import {
  describeExistingSwap,
  isCoverageMode,
} from './swapModalHelpers'
import type { SwapModalProps } from './swapModalTypes'
import { useSwapModalState } from './useSwapModalState'

export function SwapModal({
  existingSwap,
  onClose,
  ...props
}: SwapModalProps) {
  const {
    addHistoryEvent,
    addSwap,
    canSubmit,
    createCoverage,
    date,
    effectiveShift,
    existingSwapDescription,
    fromId,
    mode,
    modalMode,
    note,
    previewText,
    removeSwap,
    representatives,
    setDate,
    setFromId,
    setNote,
    setShift,
    setToId,
    shift,
    toId,
    type,
    validationContext,
    validationError,
    handleModeChange,
  } = useSwapModalState({
    ...props,
    existingSwap,
  })

  const handleDeleteSwap = () => {
    if (!existingSwap) return
    removeSwap(existingSwap.id)
    addHistoryEvent({
      category: 'PLANNING',
      title: 'Cambio de turno eliminado',
      description: existingSwapDescription,
    })
    onClose()
  }

  const handleSubmit = () => {
    if (!canSubmit || (!fromId && type !== 'DOUBLE')) return

    if (isCoverageMode(modalMode) && fromId && toId) {
      createCoverage({
        date,
        shift: effectiveShift,
        coveredRepId: fromId,
        coveringRepId: toId,
        note,
      })

      addHistoryEvent({
        category: 'PLANNING',
        title: 'Cobertura creada',
        description: `${repName(representatives, toId)} cubrirá el turno ${effectiveShift === 'DAY' ? 'Día' : 'Noche'} de ${repName(representatives, fromId)}`,
      })

      onClose()
      return
    }

    if (type === 'COVER' && fromId) {
      addSwap({
        type: 'COVER',
        date,
        shift: effectiveShift,
        fromRepresentativeId: fromId,
        toRepresentativeId: toId,
        note,
      })
    } else if (type === 'DOUBLE' && toId) {
      addSwap({
        type: 'DOUBLE',
        date,
        shift,
        representativeId: toId,
        note,
      })
    } else if (type === 'SWAP' && fromId && toId) {
      const fromShifts = validationContext.daily[fromId]?.effectiveShifts
      const toShifts = validationContext.daily[toId]?.effectiveShifts
      if (fromShifts && toShifts && fromShifts.size === 1 && toShifts.size === 1) {
        const fromShift = Array.from(fromShifts)[0]
        const toShift = Array.from(toShifts)[0]
        addSwap({
          type: 'SWAP',
          date,
          fromRepresentativeId: fromId,
          fromShift,
          toRepresentativeId: toId,
          toShift,
          note,
        })
      }
    }
    onClose()
  }

  return (
    <SwapModalView
      existingSwap={existingSwap}
      mode={mode}
      date={date}
      onDateChange={setDate}
      shift={shift}
      onShiftChange={setShift}
      modalMode={modalMode}
      onModeChange={handleModeChange}
      type={type}
      fromId={fromId}
      onFromChange={setFromId}
      toId={toId}
      onToChange={setToId}
      note={note}
      onNoteChange={setNote}
      representatives={representatives}
      effectiveShift={effectiveShift}
      validationContext={validationContext}
      previewText={previewText}
      validationError={validationError}
      canSubmit={canSubmit}
      existingSwapDescription={existingSwapDescription}
      onClose={onClose}
      onConfirm={handleSubmit}
      onDelete={handleDeleteSwap}
    />
  )
}
