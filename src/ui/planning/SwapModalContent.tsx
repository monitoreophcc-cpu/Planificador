import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Sun,
  Moon,
  Shield,
  ArrowLeftRight,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type {
  Representative,
  ShiftType,
  SwapEvent,
  SwapType,
} from '@/domain/types'
import type { EffectiveSwapContext } from '@/domain/swaps/buildDailyEffectiveContext'
import type { SwapModalMode } from './swapModalHelpers'

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

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
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
    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
      {existingSwap ? (
        <ExistingSwapSummary
          existingSwap={existingSwap}
          description={existingSwapDescription}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <TypeCard
              active={modalMode === 'COBERTURA'}
              onClick={() => onModeChange('COBERTURA')}
              icon={Shield}
              label="Cubrir"
              color="blue"
            />
            <TypeCard
              active={modalMode === 'SWAP'}
              onClick={() => onModeChange('SWAP')}
              icon={ArrowLeftRight}
              label="Intercambio"
              color="green"
            />
            <TypeCard
              active={modalMode === 'DOUBLE'}
              onClick={() => onModeChange('DOUBLE')}
              icon={Copy}
              label="Doble"
              color="orange"
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {type !== 'DOUBLE' && (
              <div>
                <label style={labelStyle}>
                  {type === 'SWAP'
                    ? 'Quien cede (Origen)'
                    : 'Quien necesita cobertura'}
                </label>
                <select
                  style={inputStyle}
                  value={fromId}
                  onChange={event => onFromChange(event.target.value)}
                >
                  <option value="">Seleccionar representante...</option>
                  {representatives.map(representative => (
                    <option key={representative.id} value={representative.id}>
                      {representative.name}
                    </option>
                  ))}
                </select>
                {type === 'COVER' &&
                  fromId &&
                  validationContext.daily[fromId] && (
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
                      {effectiveShift === 'DAY' ? (
                        <Sun size={14} />
                      ) : (
                        <Moon size={14} />
                      )}
                      <span>
                        Turno a cubrir:{' '}
                        <strong>
                          {effectiveShift === 'DAY' ? 'Dia' : 'Noche'}
                        </strong>
                      </span>
                    </div>
                  )}
              </div>
            )}

            <div>
              <label style={labelStyle}>
                {type === 'DOUBLE'
                  ? 'Quien hara el doble turno'
                  : type === 'SWAP'
                    ? 'Con quien intercambia'
                    : 'Quien va a cubrir'}
              </label>
              <select
                style={inputStyle}
                value={toId}
                onChange={event => onToChange(event.target.value)}
              >
                <option value="">Seleccionar representante...</option>
                {representatives.map(representative => (
                  <option key={representative.id} value={representative.id}>
                    {representative.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {previewText && !validationError && (
            <FeedbackBox
              icon={CheckCircle2}
              iconColor="#16a34a"
              backgroundColor="#f9fafb"
              borderColor="#e5e7eb"
              textColor="#374151"
            >
              {previewText}
            </FeedbackBox>
          )}

          {validationError && (
            <FeedbackBox
              icon={AlertTriangle}
              iconColor="#ef4444"
              backgroundColor="#fef2f2"
              borderColor="#fee2e2"
              textColor="#b91c1c"
            >
              {validationError}
            </FeedbackBox>
          )}

          <div>
            <label style={labelStyle}>Nota Adicional (Opcional)</label>
            <input
              style={inputStyle}
              placeholder="Ej: Cambio autorizado por jefe de guardia..."
              value={note}
              onChange={event => onNoteChange(event.target.value)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function ExistingSwapSummary({
  existingSwap,
  description,
}: {
  existingSwap: SwapEvent
  description: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle
          size={24}
          color="#b45309"
          style={{ flexShrink: 0 }}
        />
        <div>
          <div style={{ fontWeight: 600, color: '#92400e' }}>
            Cambio de turno activo
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#78350f',
              marginTop: '4px',
            }}
          >
            {description}
          </div>
          {existingSwap.note && (
            <div
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                marginTop: '8px',
                color: '#78350f',
              }}
            >
              Nota: {existingSwap.note}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
        Si eliminas este cambio, la celda volvera a su estado original segun
        el plan base (WORKING u OFF).
      </div>
    </div>
  )
}

function FeedbackBox({
  icon: Icon,
  iconColor,
  backgroundColor,
  borderColor,
  textColor,
  children,
}: {
  icon: LucideIcon
  iconColor: string
  backgroundColor: string
  borderColor: string
  textColor: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <Icon
        color={iconColor}
        size={18}
        style={{ marginTop: '2px', flexShrink: 0 }}
      />
      <div
        style={{
          fontSize: '14px',
          color: textColor,
          lineHeight: '1.5',
          fontWeight: iconColor === '#ef4444' ? 500 : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function TypeCard({
  active,
  onClick,
  icon: Icon,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  color: 'blue' | 'green' | 'orange'
}) {
  const styles = getColorStyles(color, active)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        borderRadius: '12px',
        border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
      }}
    >
      <Icon
        size={24}
        style={{ color: active ? 'inherit' : '#9ca3af' }}
        strokeWidth={1.5}
      />
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
    </button>
  )
}

function getColorStyles(
  color: 'blue' | 'green' | 'orange',
  isActive: boolean
) {
  if (!isActive) {
    return {
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      color: '#4b5563',
    }
  }

  switch (color) {
    case 'blue':
      return {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
        color: '#1d4ed8',
      }
    case 'green':
      return {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        color: '#15803d',
      }
    case 'orange':
      return {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa',
        color: '#c2410c',
      }
  }
}
