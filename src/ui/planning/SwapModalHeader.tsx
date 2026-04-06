import type { CSSProperties } from 'react'
import { Sun, Moon, X } from 'lucide-react'
import type { ISODate, ShiftType, SwapEvent } from '@/domain/types'

type SwapModalHeaderProps = {
  existingSwap?: SwapEvent
  date: ISODate
  onDateChange: (date: ISODate) => void
  shift: ShiftType
  onShiftChange: (shift: ShiftType) => void
  onClose: () => void
}

const headerStyle: CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '16px 24px',
  borderBottom: '1px solid #f3f4f6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

const btnCloseStyle: CSSProperties = {
  color: '#9ca3af',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
}

export function SwapModalHeader({
  existingSwap,
  date,
  onDateChange,
  shift,
  onShiftChange,
  onClose,
}: SwapModalHeaderProps) {
  return (
    <div style={headerStyle}>
      <div>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: 0,
          }}
        >
          Gestion de Cobertura
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <input
            type="date"
            style={{
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '4px 8px',
              color: '#374151',
            }}
            value={date}
            onChange={event => onDateChange(event.target.value)}
            disabled={!!existingSwap}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onShiftChange('DAY')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  shift === 'DAY'
                    ? '1px solid #fcd34d'
                    : '1px solid #e5e7eb',
                backgroundColor: shift === 'DAY' ? '#fffbeb' : 'white',
                color: shift === 'DAY' ? '#b45309' : '#6b7280',
                pointerEvents: existingSwap ? 'none' : 'auto',
                opacity: existingSwap ? 0.7 : 1,
              }}
            >
              <Sun size={12} /> Dia
            </button>
            <button
              onClick={() => onShiftChange('NIGHT')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  shift === 'NIGHT'
                    ? '1px solid #c7d2fe'
                    : '1px solid #e5e7eb',
                backgroundColor: shift === 'NIGHT' ? '#eef2ff' : 'white',
                color: shift === 'NIGHT' ? '#4338ca' : '#6b7280',
                pointerEvents: existingSwap ? 'none' : 'auto',
                opacity: existingSwap ? 0.7 : 1,
              }}
            >
              <Moon size={12} /> Noche
            </button>
          </div>
        </div>
      </div>
      <button onClick={onClose} style={btnCloseStyle}>
        <X size={20} />
      </button>
    </div>
  )
}
