'use client'

import React from 'react'
import {
  Activity,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Shield,
  Sun,
  Moon,
  UserRound,
} from 'lucide-react'
import { DailyLogDateNavigator } from './DailyLogDateNavigator'
import { DailyLogFilterTabs } from './DailyLogFilterTabs'

export type DailyLogFilterMode = 'TODAY' | 'WEEK' | 'MONTH'

type DailyLogToolbarProps = {
  activeCoveragesCount: number
  activeShift: 'DAY' | 'NIGHT'
  coveringCount: number
  date: Date
  dayIncidentsCount: number
  dayPlanned: number
  dayPresent: number
  filterMode: DailyLogFilterMode
  isExpanded: boolean
  nightPlanned: number
  nightPresent: number
  ongoingIncidentsCount: number
  onActiveShiftChange: (shift: 'DAY' | 'NIGHT') => void
  onDateChange: (date: Date) => void
  onFilterModeChange: (mode: DailyLogFilterMode) => void
  onToggleExpanded: () => void
  selectedRepName?: string
  visibleRepresentatives: number
}

export function DailyLogToolbar({
  activeCoveragesCount,
  activeShift,
  coveringCount,
  date,
  dayIncidentsCount,
  dayPlanned,
  dayPresent,
  filterMode,
  isExpanded,
  nightPlanned,
  nightPresent,
  ongoingIncidentsCount,
  onActiveShiftChange,
  onDateChange,
  onFilterModeChange,
  onToggleExpanded,
  selectedRepName,
  visibleRepresentatives,
}: DailyLogToolbarProps) {
  const primaryStats = [
    {
      label:
        filterMode === 'TODAY'
          ? 'Incidencias del día'
          : filterMode === 'WEEK'
            ? 'Incidencias de la semana'
            : 'Incidencias del mes',
      value: dayIncidentsCount.toString(),
      note:
        filterMode === 'TODAY'
          ? 'Eventos del día seleccionado'
          : filterMode === 'WEEK'
            ? 'Eventos dentro de la semana activa'
            : 'Eventos dentro del mes activo',
      icon: Activity,
      accent: 'var(--accent)',
      background: 'rgba(var(--accent-rgb), 0.08)',
      border: 'rgba(var(--accent-rgb), 0.18)',
    },
    {
      label: 'Eventos en curso',
      value: ongoingIncidentsCount.toString(),
      note: 'Licencias y vacaciones activas',
      icon: CalendarRange,
      accent: 'var(--success)',
      background: 'var(--bg-success)',
      border: 'var(--border-success)',
    },
  ]

  const compactMetrics = [
    {
      label: 'Día',
      value: `${dayPresent}/${dayPlanned}`,
      icon: Sun,
      accent: 'var(--accent-warm)',
    },
    {
      label: 'Noche',
      value: `${nightPresent}/${nightPlanned}`,
      icon: Moon,
      accent: 'var(--accent)',
    },
    {
      label: 'Coberturas',
      value: activeCoveragesCount.toString(),
      icon: Shield,
      accent: 'var(--success)',
      note:
        coveringCount > 0 ? `${coveringCount} personas cubriendo` : undefined,
    },
  ]

  return (
    <section
      style={{
        borderRadius: '26px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 58%, rgba(var(--accent-rgb), 0.08) 100%)',
        boxShadow: 'var(--shadow-md)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '18px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '72ch' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
            }}
          >
            Centro operativo del día
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              lineHeight: 1.1,
              color: 'var(--text-main)',
            }}
          >
            Registro Diario
          </h2>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
            }}
          >
            {isExpanded
              ? 'Aquí ves el resumen operativo completo antes de registrar algo.'
              : 'Vista compacta para entrar directo al registro. Puedes abrir el resumen cuando lo necesites.'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onToggleExpanded}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 13px',
              borderRadius: '999px',
              border: '1px solid rgba(var(--accent-rgb), 0.16)',
              background: 'rgba(var(--accent-rgb), 0.08)',
              color: 'var(--accent-strong)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? 'Ocultar resumen' : 'Ver resumen operativo'}
          </button>

          <DailyLogDateNavigator date={date} onDateChange={onDateChange} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onActiveShiftChange('DAY')}
            style={getShiftChipStyle(activeShift === 'DAY', 'var(--accent-warm)')}
          >
            <Sun size={15} />
            Día
          </button>
          <button
            type="button"
            onClick={() => onActiveShiftChange('NIGHT')}
            style={getShiftChipStyle(activeShift === 'NIGHT', 'var(--accent)')}
          >
            <Moon size={15} />
            Noche
          </button>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid var(--shell-border)',
              background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <UserRound size={14} />
            {visibleRepresentatives} representantes visibles
          </span>
          {selectedRepName ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(var(--accent-rgb), 0.16)',
                background: 'rgba(var(--accent-rgb), 0.08)',
                color: 'var(--accent-strong)',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Foco operativo: destaca al representante seleccionado para registrar más rápido."
            >
              Foco actual: {selectedRepName}
            </span>
          ) : null}
        </div>

        <DailyLogFilterTabs
          filterMode={filterMode}
          onFilterModeChange={onFilterModeChange}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {primaryStats.map(item => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              style={{
                borderRadius: '16px',
                border: `1px solid ${item.border}`,
                background: `linear-gradient(180deg, ${item.background} 0%, var(--surface-raised) 100%)`,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--surface-raised)',
                  color: item.accent,
                  border: `1px solid ${item.border}`,
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: '4px',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'var(--text-muted)',
                  }}
                >
                  {item.note}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isExpanded ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {compactMetrics.map(metric => {
            const Icon = metric.icon

            return (
              <div
                key={metric.label}
                style={{
                borderRadius: '16px',
                border: '1px solid var(--shell-border)',
                background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.64)',
                    color: metric.accent,
                    border: '1px solid var(--shell-border)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                      marginBottom: '2px',
                    }}
                  >
                    {metric.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                    }}
                  >
                    {metric.value}
                  </div>
                  {metric.note ? (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {metric.note}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

function getShiftChipStyle(isActive: boolean, accent: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${isActive ? accent : 'var(--shell-border)'}`,
    background: isActive
      ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
      : 'transparent',
    color: isActive ? accent : 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
  }
}
