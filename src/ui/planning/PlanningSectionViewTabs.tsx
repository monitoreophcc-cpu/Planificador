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
    padding: '10px 14px',
    cursor: 'pointer',
    border: `1px solid ${isActive ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
    color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
    fontWeight: isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-medium)',
    background: isActive
      ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
      : 'transparent',
    fontSize: '14px',
    marginRight: '10px',
    borderRadius: '16px',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
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
          border: '1px solid var(--shell-border)',
          borderRadius: '22px',
          background:
            'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-tint) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '10px 12px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
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
              padding: '10px 14px',
              background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
              color: 'var(--text-on-accent)',
              border: '1px solid rgba(var(--accent-rgb), 0.24)',
              borderRadius: '16px',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              boxShadow: '0 18px 30px rgba(var(--accent-rgb), 0.16)',
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
