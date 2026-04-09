'use client'

import type { ShiftType } from '@/domain/types'
import { HelpPanel } from '../components/HelpPanel'

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
    <section
      style={{
        padding: '22px 24px',
        background:
          'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 58%, rgba(var(--accent-rgb), 0.08) 100%)',
        borderRadius: '26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '18px',
        flexWrap: 'wrap',
        border: `1px solid ${
          highlightAdminOverride ? 'rgba(var(--accent-warm-rgb), 0.34)' : 'var(--shell-border)'
        }`,
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          maxWidth: '72ch',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(var(--accent-rgb), 0.16)',
            background: 'rgba(var(--accent-rgb), 0.08)',
            color: 'var(--accent-strong)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Armado semanal
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              flexWrap: 'wrap',
            }}
          >
            Planificación
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '6px 10px',
                borderRadius: '99px',
                background:
                  activeShift === 'DAY'
                    ? 'rgba(var(--accent-warm-rgb), 0.12)'
                    : 'rgba(var(--accent-rgb), 0.08)',
                color:
                  activeShift === 'DAY' ? 'var(--accent-warm)' : 'var(--accent-strong)',
                border:
                  activeShift === 'DAY'
                    ? '1px solid rgba(var(--accent-warm-rgb), 0.18)'
                    : '1px solid rgba(var(--accent-rgb), 0.18)',
              }}
            >
              {activeShift === 'DAY' ? 'Turno Día' : 'Turno Noche'}
            </span>
          </h2>
          <HelpPanel
            title="Cómo usar el planner"
            points={[
              'Haz clic en una celda para cambiar el turno del representante',
              'Haz clic derecho para gestionar cambios y coberturas',
              'El gráfico de cobertura compara lo requerido con lo asignado',
            ]}
          />
        </div>

        <p
          style={{
            margin: 0,
            color: 'var(--text-muted)',
            fontSize: '14px',
            lineHeight: 1.65,
          }}
        >
          Ajusta la semana, revisa cobertura y abre excepciones sin perder de vista el contexto operativo.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          flexWrap: 'wrap',
          marginLeft: 'auto',
          justifyContent: 'flex-end',
        }}
      >
        {!isCurrentWeek && (
          <button
            onClick={onGoToday}
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              border: '1px solid var(--shell-border)',
              borderRadius: '999px',
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
            background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
            padding: '6px',
            borderRadius: '18px',
            border: '1px solid var(--shell-border)',
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
              borderRadius: '12px',
              color: 'var(--text-main)',
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
              letterSpacing: '-0.02em',
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
              borderRadius: '12px',
              color: 'var(--text-main)',
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  )
}
