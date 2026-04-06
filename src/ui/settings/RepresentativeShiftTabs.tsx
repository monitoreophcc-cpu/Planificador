'use client'

import { Moon, Sun } from 'lucide-react'
import type { Representative, ShiftType } from '@/domain/types'
import { Tooltip } from '../components/Tooltip'
import { ShiftSection } from './components/ShiftSection'

interface RepresentativeShiftTabsProps {
  activeRepsCount: number
  activeShift: ShiftType | 'ALL'
  advancedEditMode: boolean
  addingScheduleFor: string | null
  dayReps: Representative[]
  nightReps: Representative[]
  onActiveShiftChange: (shift: ShiftType | 'ALL') => void
  onAddSchedule: (repId: string | null) => void
  onEdit: (rep: Representative) => void
}

export function RepresentativeShiftTabs({
  activeRepsCount,
  activeShift,
  advancedEditMode,
  addingScheduleFor,
  dayReps,
  nightReps,
  onActiveShiftChange,
  onAddSchedule,
  onEdit,
}: RepresentativeShiftTabsProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '8px',
        }}
      >
        <Tooltip content="Vista de solo lectura. Selecciona un turno para reordenar">
          <button
            onClick={() => onActiveShiftChange('ALL')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom:
                activeShift === 'ALL' ? '2px solid #111827' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: activeShift === 'ALL' ? 600 : 400,
              color: activeShift === 'ALL' ? '#111827' : '#6b7280',
              fontSize: '14px',
            }}
          >
            Todos ({activeRepsCount})
          </button>
        </Tooltip>
        <button
          onClick={() => onActiveShiftChange('DAY')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderBottom:
              activeShift === 'DAY' ? '2px solid #f59e0b' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: activeShift === 'DAY' ? 600 : 400,
            color: activeShift === 'DAY' ? '#f59e0b' : '#6b7280',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sun size={16} /> Día ({dayReps.length})
        </button>
        <button
          onClick={() => onActiveShiftChange('NIGHT')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderBottom:
              activeShift === 'NIGHT' ? '2px solid #6366f1' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            fontWeight: activeShift === 'NIGHT' ? 600 : 400,
            color: activeShift === 'NIGHT' ? '#6366f1' : '#6b7280',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Moon size={16} /> Noche ({nightReps.length})
        </button>
      </div>

      {activeShift === 'ALL' ? (
        <div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              fontStyle: 'italic',
            }}
          >
            💡 Para reordenar, selecciona un turno específico
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#f59e0b',
                  fontWeight: 600,
                }}
              >
                <Sun size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Turno Día ({dayReps.length})
              </h4>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {dayReps.map(rep => rep.name).join(', ') || 'Sin representantes'}
              </div>
            </div>
            <div>
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#6366f1',
                  fontWeight: 600,
                }}
              >
                <Moon size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Turno Noche ({nightReps.length})
              </h4>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {nightReps.map(rep => rep.name).join(', ') || 'Sin representantes'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ShiftSection
          shift={activeShift}
          representatives={activeShift === 'DAY' ? dayReps : nightReps}
          onEdit={onEdit}
          onAddSchedule={onAddSchedule}
          addingScheduleFor={addingScheduleFor}
          advancedEditMode={advancedEditMode}
        />
      )}
    </div>
  )
}
