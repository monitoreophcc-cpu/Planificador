'use client'

import { HelpPanel } from '../components/HelpPanel'
import type { ShiftType } from '@/domain/types'

interface PlanningSectionHeaderProps {
  activeShift: ShiftType
  highlightAdminOverride: boolean
  isCurrentWeek: boolean
  weekLabel: string
  onGoToday: () => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function PlanningSectionHeader({
  activeShift,
  highlightAdminOverride,
  isCurrentWeek,
  weekLabel,
  onGoToday,
  onPrevWeek,
  onNextWeek,
}: PlanningSectionHeaderProps) {
  return (
    <div
      style={{
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-md) var(--space-lg)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: `1px solid ${
          highlightAdminOverride ? '#f59e0b' : 'var(--border-subtle)'
        }`,
        height: '74px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              color: 'var(--text-main)',
            }}
          >
            Planificacion
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              {activeShift === 'DAY' ? 'Turno Dia' : 'Turno Noche'}
            </span>
          </h2>
          <HelpPanel
            title="Como usar el planner"
            points={[
              'Click en una celda para cambiar el turno del agente',
              'Click derecho para gestionar swaps y coberturas',
              'El grafico lateral muestra la cobertura requerida vs actual',
            ]}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          {!isCurrentWeek && (
            <button
              onClick={onGoToday}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Hoy
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              background: 'var(--bg-surface)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              onClick={onPrevWeek}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              &lt;
            </button>
            <div
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-main)',
                width: '220px',
                textAlign: 'center',
              }}
            >
              {weekLabel}
            </div>
            <button
              onClick={onNextWeek}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
