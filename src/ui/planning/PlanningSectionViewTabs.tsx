'use client'

import type { ShiftType } from '@/domain/types'

export type PlanningSectionViewMode = 'OPERATIONAL' | 'MANAGERIAL'

interface PlanningSectionViewTabsProps {
  activeShift: ShiftType
  viewMode: PlanningSectionViewMode
  onSelectDay: () => void
  onSelectNight: () => void
  onSelectManagerial: () => void
  onOpenSwapManager: () => void
}

function shiftTabStyle(isActive: boolean) {
  return {
    padding: 'var(--space-sm) var(--space-md)',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive
      ? '2px solid var(--text-main)'
      : '2px solid transparent',
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    fontWeight: isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-medium)',
    background: 'transparent',
    fontSize: 'var(--font-size-md)',
    marginRight: '10px',
  } as const
}

export function PlanningSectionViewTabs({
  activeShift,
  viewMode,
  onSelectDay,
  onSelectNight,
  onSelectManagerial,
  onOpenSwapManager,
}: PlanningSectionViewTabsProps) {
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <button
            style={shiftTabStyle(
              activeShift === 'DAY' && viewMode === 'OPERATIONAL'
            )}
            onClick={onSelectDay}
          >
            Turno Dia
          </button>
          <button
            style={shiftTabStyle(
              activeShift === 'NIGHT' && viewMode === 'OPERATIONAL'
            )}
            onClick={onSelectNight}
          >
            Turno Noche
          </button>
          <button
            style={shiftTabStyle(viewMode === 'MANAGERIAL')}
            onClick={onSelectManagerial}
          >
            Horario Gerencial
          </button>
        </div>

        {viewMode === 'OPERATIONAL' && (
          <button
            onClick={onOpenSwapManager}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-base)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Gestionar Cambios
          </button>
        )}
      </div>
    </div>
  )
}
