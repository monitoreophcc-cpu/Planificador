'use client'

import type { ShiftType } from '@/domain/types'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'

export type PlanningSectionViewMode = 'OPERATIONAL' | 'MANAGERIAL'

interface PlanningSectionViewTabsProps {
  activeShift: ShiftType
  canEditData?: boolean
  viewMode: PlanningSectionViewMode
  onSelectDay: () => void
  onSelectNight: () => void
  onSelectManagerial: () => void
  onOpenSwapManager: () => void
}

function shiftTabStyle(isActive: boolean) {
  return {
    padding: '14px 34px',
    cursor: 'pointer',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: isActive ? 700 : 600,
    background: isActive ? 'rgba(var(--accent-rgb), 0.06)' : 'transparent',
    fontSize: '14px',
    marginRight: '8px',
    borderRadius: '18px',
    boxShadow: 'none',
  } as const
}

export function PlanningSectionViewTabs({
  activeShift,
  canEditData = true,
  viewMode,
  onSelectDay,
  onSelectNight,
  onSelectManagerial,
  onOpenSwapManager,
}: PlanningSectionViewTabsProps) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div
        style={{
          border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
          borderRadius: '22px',
          background: PLANNER_THEME.shellSurfaceTinted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '14px 16px',
          boxShadow: PLANNER_THEME.shellShadow,
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
            Turno Día
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
            onClick={canEditData ? onOpenSwapManager : undefined}
            style={{
              padding: '14px 22px',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: canEditData ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'none',
              opacity: canEditData ? 1 : 0.6,
            }}
            disabled={!canEditData}
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
