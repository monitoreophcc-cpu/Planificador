import { Moon, Sun } from 'lucide-react'
import type { ShiftType } from '@/domain/types'
import type { CSSProperties } from 'react'

interface RepresentativeShiftSelectorProps {
  baseShift: ShiftType
  onChange: (shift: ShiftType) => void
}

function getShiftButtonStyle(
  active: boolean,
  palette: { activeBackground: string; activeBorder: string; activeText: string }
): CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    background: active ? palette.activeBackground : 'white',
    borderColor: active ? palette.activeBorder : '#d1d5db',
    color: active ? palette.activeText : '#374151',
  }
}

export function RepresentativeShiftSelector({
  baseShift,
  onChange,
}: RepresentativeShiftSelectorProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '6px',
          color: 'var(--text-main)',
        }}
      >
        Turno Base
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onChange('DAY')}
          style={getShiftButtonStyle(baseShift === 'DAY', {
            activeBackground: '#fffbeb',
            activeBorder: '#fcd34d',
            activeText: '#b45309',
          })}
        >
          <Sun size={16} /> Día
        </button>
        <button
          type="button"
          onClick={() => onChange('NIGHT')}
          style={getShiftButtonStyle(baseShift === 'NIGHT', {
            activeBackground: '#eef2ff',
            activeBorder: '#c7d2fe',
            activeText: '#4338ca',
          })}
        >
          <Moon size={16} /> Noche
        </button>
      </div>
    </div>
  )
}
