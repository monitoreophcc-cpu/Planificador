import type { CSSProperties, ReactNode } from 'react'
import type { EditMode } from '@/hooks/useEditMode'
import type {
  ISODate,
  Representative,
  ShiftType,
  SwapEvent,
  SwapType,
} from '@/domain/types'
import type { EffectiveSwapContext } from '@/domain/swaps/buildDailyEffectiveContext'
import type { SwapModalMode } from './swapModalHelpers'
import { SwapModalHeader } from './SwapModalHeader'
import { SwapModalContent } from './SwapModalContent'
import { SwapModalFooter } from './SwapModalFooter'

type SwapModalViewProps = {
  existingSwap?: SwapEvent
  mode: EditMode
  date: ISODate
  onDateChange: (date: ISODate) => void
  shift: ShiftType
  onShiftChange: (shift: ShiftType) => void
  modalMode: SwapModalMode
  onModeChange: (mode: SwapModalMode) => void
  type: SwapType
  fromId: string
  onFromChange: (id: string) => void
  toId: string
  onToChange: (id: string) => void
  note: string
  onNoteChange: (value: string) => void
  representatives: Representative[]
  effectiveShift: ShiftType
  validationContext: EffectiveSwapContext
  previewText: ReactNode
  validationError: string | null
  canSubmit: boolean
  existingSwapDescription: string
  onClose: () => void
  onConfirm: () => void
  onDelete: () => void
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: '16px',
}

const modalStyle: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  width: '100%',
  maxWidth: '500px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
}

export function SwapModalView({
  existingSwap,
  mode,
  date,
  onDateChange,
  shift,
  onShiftChange,
  modalMode,
  onModeChange,
  type,
  fromId,
  onFromChange,
  toId,
  onToChange,
  note,
  onNoteChange,
  representatives,
  effectiveShift,
  validationContext,
  previewText,
  validationError,
  canSubmit,
  existingSwapDescription,
  onClose,
  onConfirm,
  onDelete,
}: SwapModalViewProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={event => event.stopPropagation()}>
        <SwapModalHeader
          existingSwap={existingSwap}
          date={date}
          onDateChange={onDateChange}
          shift={shift}
          onShiftChange={onShiftChange}
          onClose={onClose}
        />

        <SwapModalContent
          existingSwap={existingSwap}
          existingSwapDescription={existingSwapDescription}
          modalMode={modalMode}
          onModeChange={onModeChange}
          type={type}
          fromId={fromId}
          onFromChange={onFromChange}
          toId={toId}
          onToChange={onToChange}
          note={note}
          onNoteChange={onNoteChange}
          representatives={representatives}
          effectiveShift={effectiveShift}
          validationContext={validationContext}
          previewText={previewText}
          validationError={validationError}
        />

        <SwapModalFooter
          existingSwap={existingSwap}
          mode={mode}
          canSubmit={canSubmit}
          onClose={onClose}
          onConfirm={onConfirm}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
