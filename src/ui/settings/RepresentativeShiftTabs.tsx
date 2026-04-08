'use client'

import { Moon, Sun } from 'lucide-react'
import type { Representative, ShiftType } from '@/domain/types'
import { Tooltip } from '../components/Tooltip'
import { ShiftSection } from './components/ShiftSection'

interface RepresentativeShiftTabsProps {
  activeRepsCount: number
  activeShift: ShiftType | 'ALL'
  advancedEditMode: boolean
  dayReps: Representative[]
  nightReps: Representative[]
  selectedRepId: string | null
  onActiveShiftChange: (shift: ShiftType | 'ALL') => void
  onEdit: (rep: Representative) => void
  onSelect: (rep: Representative) => void
}

export function RepresentativeShiftTabs({
  activeRepsCount,
  activeShift,
  advancedEditMode,
  dayReps,
  nightReps,
  selectedRepId,
  onActiveShiftChange,
  onEdit,
  onSelect,
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
              lineHeight: 1.55,
            }}
          >
            Revisa ambos turnos sin salir del contexto. Para reordenar, cambia a una
            vista específica de turno.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ShiftSection
              shift="DAY"
              title={`Turno Día`}
              representatives={dayReps}
              selectedRepId={selectedRepId}
              onSelect={onSelect}
              onEdit={onEdit}
              advancedEditMode={advancedEditMode}
              allowReorder={false}
            />
            <ShiftSection
              shift="NIGHT"
              title={`Turno Noche`}
              representatives={nightReps}
              selectedRepId={selectedRepId}
              onSelect={onSelect}
              onEdit={onEdit}
              advancedEditMode={advancedEditMode}
              allowReorder={false}
            />
          </div>
        </div>
      ) : (
        <ShiftSection
          shift={activeShift}
          representatives={activeShift === 'DAY' ? dayReps : nightReps}
          selectedRepId={selectedRepId}
          onSelect={onSelect}
          onEdit={onEdit}
          advancedEditMode={advancedEditMode}
        />
      )}
    </div>
  )
}
