'use client'

import { useMemo, useRef } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

export type StatsWorkspaceMode = 'SUMMARY' | 'ANALYSIS'

interface StatsWorkspaceHeaderProps {
  mode: StatsWorkspaceMode
  currentDate: Date
  onDateChange: (nextDate: Date) => void
  onModeChange: (mode: StatsWorkspaceMode) => void
}

function segmentedButtonStyle(isActive: boolean) {
  return {
    padding: '8px 14px',
    borderRadius: '12px',
    border: '1px solid transparent',
    background: isActive
      ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.72) 100%)'
      : 'transparent',
    color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 600,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
    whiteSpace: 'nowrap',
  } as const
}

export function StatsWorkspaceHeader({
  mode,
  currentDate,
  onDateChange,
  onModeChange,
}: StatsWorkspaceHeaderProps) {
  const monthInputRef = useRef<HTMLInputElement | null>(null)

  const monthControlLabel = useMemo(
    () => format(currentDate, 'MMMM yyyy', { locale: es }),
    [currentDate]
  )

  const openMonthPicker = () => {
    const input = monthInputRef.current

    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.click()
  }

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '18px 20px',
        borderRadius: '24px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,242,233,0.52) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '8px',
            }}
          >
            Lectura operativa
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.6rem',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--text-main)',
              fontWeight: 800,
            }}
          >
            Reportes y tendencias
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              maxWidth: '540px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              lineHeight: 1.45,
            }}
          >
            El período manda la lectura mensual; el resto del contenido solo ayuda a entender qué pasó y dónde mirar primero.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid var(--shell-border)',
            background: 'var(--surface-tint)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          <button
            type="button"
            style={segmentedButtonStyle(mode === 'SUMMARY')}
            onClick={() => onModeChange('SUMMARY')}
          >
            Resumen
          </button>
          <button
            type="button"
            style={segmentedButtonStyle(mode === 'ANALYSIS')}
            onClick={() => onModeChange('ANALYSIS')}
          >
            Análisis
          </button>
        </div>
      </div>

      {mode === 'SUMMARY' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
            paddingTop: '2px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '16px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.74)',
            }}
          >
            <button
              type="button"
              onClick={() => onDateChange(subMonths(currentDate, 1))}
              aria-label="Mes anterior"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>

            <div
              style={{
                minWidth: '170px',
                padding: '0 12px',
                textAlign: 'center',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'capitalize',
                letterSpacing: '-0.02em',
              }}
            >
              {monthControlLabel}
            </div>

            <button
              type="button"
              onClick={() => onDateChange(addMonths(currentDate, 1))}
              aria-label="Mes siguiente"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          <button
            type="button"
            onClick={openMonthPicker}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '14px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.74)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <CalendarDays size={15} strokeWidth={2.2} />
            Elegir mes
          </button>

          <input
            ref={monthInputRef}
            type="month"
            value={format(currentDate, 'yyyy-MM')}
            onChange={event => {
              if (!event.target.value) return

              onDateChange(new Date(`${event.target.value}-01T12:00:00`))
            }}
            aria-label="Elegir mes"
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 1,
              height: 1,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '14px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.72)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Análisis enfocado en comparativos y datos cargados
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Sin controles temporales duplicados dentro del contenido.
          </div>
        </div>
      )}
    </section>
  )
}
