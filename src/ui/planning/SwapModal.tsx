import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useEditMode } from '@/hooks/useEditMode'
import type { ISODate, ShiftType, SwapEvent, SwapType, WeeklyPlan } from '@/domain/types'
import { validateSwapOperation } from '@/domain/swaps/validateSwapOperation'
import {
  buildDailyEffectiveContext,
  type EffectiveSwapContext,
} from '@/domain/swaps/buildDailyEffectiveContext'
import { repName } from '@/application/presenters/humanize'
import { SwapModalView } from './SwapModalView'
import {
  buildSwapPreviewText,
  describeExistingSwap,
  isCoverageMode,
  resolveInitialSwapModalDate,
  resolveInitialSwapModalMode,
  type SwapModalMode,
} from './swapModalHelpers'

interface SwapModalProps {
  weeklyPlan: WeeklyPlan // 🎯 Plan viene de arriba, no se carga aquí
  initialDate?: ISODate
  initialShift?: ShiftType
  initialRepId?: string
  existingSwap?: SwapEvent
  onClose: () => void
}

export function SwapModal({
  weeklyPlan,
  initialDate,
  initialShift,
  initialRepId,
  existingSwap,
  onClose,
}: SwapModalProps) {
  const {
    representatives,
    addSwap,
    planningAnchorDate,
    incidents,
    allCalendarDaysForRelevantMonths,
    removeSwap,
    addHistoryEvent,
    swaps,
  } = useAppStore(s => ({
    representatives: s.representatives,
    addSwap: s.addSwap,
    planningAnchorDate: s.planningAnchorDate,
    incidents: s.incidents,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    removeSwap: s.removeSwap,
    addHistoryEvent: s.addHistoryEvent,
    swaps: s.swaps,
  }))

  // 🔄 NEW: Coverage store
  const { createCoverage } = useCoverageStore()

  const { mode } = useEditMode()
  const [date, setDate] = useState<ISODate>(
    resolveInitialSwapModalDate(initialDate, planningAnchorDate)
  )
  const [modalMode, setModalMode] = useState<SwapModalMode>(
    resolveInitialSwapModalMode(existingSwap)
  )
  const [shift, setShift] = useState<ShiftType>(initialShift || 'DAY')

  // 🎯 CAMBIO CRÍTICO: Delegar construcción de contexto al dominio
  // El modal ya NO construye el contexto manualmente
  // El dominio provee la verdad (estado efectivo incluyendo swaps existentes)
  const validationContext = useMemo((): EffectiveSwapContext => {
    if (!weeklyPlan) return { daily: {} }

    return buildDailyEffectiveContext({
      date,
      weeklyPlan,
      swaps,  // ← CRÍTICO: incluir swaps existentes para detectar doble cobertura
      incidents,
      allCalendarDays: allCalendarDaysForRelevantMonths,
      representatives,
    })
  }, [
    date,
    weeklyPlan,
    swaps,  // ← NUEVO: dependencia crítica
    incidents,
    allCalendarDaysForRelevantMonths,
    representatives,
  ])

  const [type, setType] = useState<SwapType>(existingSwap?.type || 'COVER')
  const [fromId, setFromId] = useState<string>(initialRepId || (existingSwap && 'fromRepresentativeId' in existingSwap ? existingSwap.fromRepresentativeId : '') || '')
  const [toId, setToId] = useState<string>((existingSwap && 'toRepresentativeId' in existingSwap ? existingSwap.toRepresentativeId : (existingSwap && 'representativeId' in existingSwap ? existingSwap.representativeId : '')) || '')
  const [note, setNote] = useState(existingSwap?.note || '')

  const effectiveShift = useMemo(() => {
    if (type === 'COVER' && fromId && validationContext.daily[fromId]) {
      const day = validationContext.daily[fromId]
      // Detectar turno del plan base
      const baseShifts = Array.from(day.baseShifts)
      if (baseShifts.length === 1) {
        return baseShifts[0]
      }
    }
    return shift
  }, [type, fromId, shift, validationContext])

  const validationError = useMemo(() => {
    if (!type || !date) return null
    return validateSwapOperation(type, fromId, toId, effectiveShift, validationContext)
  }, [type, fromId, toId, date, effectiveShift, validationContext])

  const canSubmit = useMemo(() => {
    if (validationError) return false
    if (isCoverageMode(modalMode)) return Boolean(fromId && toId && date)
    if (type === 'DOUBLE') return Boolean(toId && date)
    if (type === 'COVER' || type === 'SWAP') return Boolean(fromId && toId && date)
    return false
  }, [modalMode, type, fromId, toId, validationError, date])

  const previewText = useMemo(() => {
    return buildSwapPreviewText({
      mode: modalMode,
      type,
      canSubmit,
      fromId,
      toId,
      shift,
      effectiveShift,
      validationContext,
      representatives,
    })
  }, [
    modalMode,
    type,
    canSubmit,
    fromId,
    toId,
    shift,
    effectiveShift,
    validationContext,
    representatives,
  ])

  const existingSwapDescription = useMemo(() => {
    if (!existingSwap) return ''
    return describeExistingSwap(existingSwap, representatives)
  }, [existingSwap, representatives])

  const handleModeChange = (nextMode: SwapModalMode) => {
    setModalMode(nextMode)

    if (nextMode === 'COBERTURA') {
      setType('COVER')
      return
    }

    setType(nextMode)
  }

  const handleDeleteSwap = () => {
    if (!existingSwap) return;
    removeSwap(existingSwap.id);
    addHistoryEvent({
      category: 'PLANNING',
      title: 'Cambio de turno eliminado',
      description: existingSwapDescription,
    });
    onClose();
  };

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
