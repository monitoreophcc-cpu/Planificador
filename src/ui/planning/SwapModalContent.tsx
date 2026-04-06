import type { CSSProperties, ReactNode } from 'react'
import type {
  Representative,
  ShiftType,
  SwapEvent,
  SwapType,
} from '@/domain/types'
import type { EffectiveSwapContext } from '@/domain/swaps/buildDailyEffectiveContext'
import type { SwapModalMode } from './swapModalHelpers'
import { SwapModalModeSelector } from './SwapModalModeSelector'
import { SwapModalParticipants } from './SwapModalParticipants'
import { SwapModalStatusPanels } from './SwapModalStatusPanels'

type SwapModalContentProps = {
  existingSwap?: SwapEvent
  existingSwapDescription: string
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
}

const contentStyle: CSSProperties = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
}

export function SwapModalContent({
  existingSwap,
  existingSwapDescription,
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
}: SwapModalContentProps) {
  return (
    <div style={contentStyle}>
      {existingSwap ? (
        <SwapModalStatusPanels
          existingSwap={existingSwap}
          existingSwapDescription={existingSwapDescription}
          previewText={previewText}
          validationError={validationError}
        />
      ) : (
        <>
          <SwapModalModeSelector
            modalMode={modalMode}
            onModeChange={onModeChange}
          />

          <SwapModalParticipants
            effectiveShift={effectiveShift}
            fromId={fromId}
            note={note}
            onFromChange={onFromChange}
            onNoteChange={onNoteChange}
            onToChange={onToChange}
            representatives={representatives}
            toId={toId}
            type={type}
            validationContext={validationContext}
          />

          <SwapModalStatusPanels
            existingSwapDescription={existingSwapDescription}
            previewText={previewText}
            validationError={validationError}
          />
        </>
      )}
    </div>
  )
}
