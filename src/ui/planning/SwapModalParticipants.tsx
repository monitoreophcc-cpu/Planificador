import type { CSSProperties } from 'react'
import { Moon, Sun } from 'lucide-react'
import type {
  Representative,
  ShiftType,
  SwapType,
} from '@/domain/types'
import type { EffectiveSwapContext } from '@/domain/swaps/buildDailyEffectiveContext'
import {
  swapModalInputStyle,
  swapModalLabelStyle,
} from './swapModalContentStyles'

type SwapModalParticipantsProps = {
  effectiveShift: ShiftType
  fromId: string
  note: string
  onFromChange: (id: string) => void
  onNoteChange: (value: string) => void
  onToChange: (id: string) => void
  representatives: Representative[]
  toId: string
  type: SwapType
  validationContext: EffectiveSwapContext
}

const fieldsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '24px',
}

export function SwapModalParticipants({
  effectiveShift,
  fromId,
  note,
  onFromChange,
  onNoteChange,
  onToChange,
  representatives,
  toId,
  type,
  validationContext,
}: SwapModalParticipantsProps) {
  return (
    <>
      <div style={fieldsContainerStyle}>
        {type !== 'DOUBLE' && (
          <RepresentativeSelect
            label={getOriginLabel(type)}
            value={fromId}
            onChange={onFromChange}
            representatives={representatives}
          >
            {type === 'COVER' &&
              fromId &&
              validationContext.daily[fromId] && (
                <CoverageShiftHint effectiveShift={effectiveShift} />
              )}
          </RepresentativeSelect>
        )}

        <RepresentativeSelect
          label={getTargetLabel(type)}
          value={toId}
          onChange={onToChange}
          representatives={representatives}
        />
      </div>

      <div>
        <label style={swapModalLabelStyle}>Nota Adicional (Opcional)</label>
        <input
          style={swapModalInputStyle}
          placeholder="Ej: Cambio autorizado por jefe de guardia..."
          value={note}
          onChange={event => onNoteChange(event.target.value)}
        />
      </div>
    </>
  )
}

function RepresentativeSelect({
  children,
  label,
  onChange,
  representatives,
  value,
}: {
  children?: React.ReactNode
  label: string
  onChange: (id: string) => void
  representatives: Representative[]
  value: string
}) {
  return (
    <div>
      <label style={swapModalLabelStyle}>{label}</label>
      <select
        style={swapModalInputStyle}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        <option value="">Seleccionar representante...</option>
        {representatives.map(representative => (
          <option key={representative.id} value={representative.id}>
            {representative.name}
          </option>
        ))}
      </select>
      {children}
    </div>
  )
}

function CoverageShiftHint({ effectiveShift }: { effectiveShift: ShiftType }) {
  return (
    <div
      style={{
        marginTop: '8px',
        fontSize: '12px',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {effectiveShift === 'DAY' ? <Sun size={14} /> : <Moon size={14} />}
      <span>
        Turno a cubrir: <strong>{effectiveShift === 'DAY' ? 'Dia' : 'Noche'}</strong>
      </span>
    </div>
  )
}

function getOriginLabel(type: SwapType) {
  return type === 'SWAP'
    ? 'Quien cede (Origen)'
    : 'Quien necesita cobertura'
}

function getTargetLabel(type: SwapType) {
  if (type === 'DOUBLE') {
    return 'Quien hara el doble turno'
  }

  return type === 'SWAP' ? 'Con quien intercambia' : 'Quien va a cubrir'
}
