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
      accent: '#1d4ed8',
      background: 'rgba(239, 246, 255, 0.96)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
    {
      label: 'Eventos en curso',
      value: ongoingIncidentsCount.toString(),
      note: 'Licencias y vacaciones activas',
      icon: CalendarRange,
      accent: '#0f766e',
      background: 'rgba(240, 253, 250, 0.96)',
      border: 'rgba(13, 148, 136, 0.18)',
    },
  ]

  const compactMetrics = [
    {
      label: 'Día',
      value: `${dayPresent}/${dayPlanned}`,
      icon: Sun,
      accent: '#b45309',
    },
    {
      label: 'Noche',
      value: `${nightPresent}/${nightPlanned}`,
      icon: Moon,
      accent: '#4338ca',
    },
    {
      label: 'Coberturas',
      value: activeCoveragesCount.toString(),
      icon: Shield,
      accent: '#7c3aed',
      note:
        coveringCount > 0 ? `${coveringCount} persona(s) cubriendo` : undefined,
    },
  ]

  return (
    <section
      style={{
        borderRadius: '24px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 52%, rgba(239,246,255,0.9) 100%)',
        boxShadow: '0 18px 44px rgba(15, 23, 42, 0.05)',
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
              color: '#2563eb',
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
              border: '1px solid rgba(37, 99, 235, 0.14)',
              background: 'rgba(239, 246, 255, 0.92)',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
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
            style={getShiftChipStyle(activeShift === 'DAY', '#f59e0b')}
          >
            <Sun size={15} />
            Día
          </button>
          <button
            type="button"
            onClick={() => onActiveShiftChange('NIGHT')}
            style={getShiftChipStyle(activeShift === 'NIGHT', '#6366f1')}
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
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'rgba(255,255,255,0.86)',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <UserRound size={14} />
            {visibleRepresentatives} representante(s) visibles
          </span>
          {selectedRepName ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(37, 99, 235, 0.16)',
                background: 'rgba(239, 246, 255, 0.92)',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
              }}
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
                background: item.background,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.88)',
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
                    color: '#64748b',
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
                    color: '#64748b',
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
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                  background: 'rgba(255,255,255,0.88)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(248,250,252,0.92)',
                    color: metric.accent,
                    border: '1px solid rgba(148, 163, 184, 0.14)',
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
                      color: '#64748b',
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
                        color: '#64748b',
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
    border: `1px solid ${isActive ? accent : 'rgba(148, 163, 184, 0.18)'}`,
    background: isActive ? 'white' : 'rgba(255,255,255,0.78)',
    color: isActive ? accent : '#475569',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: isActive ? '0 10px 20px rgba(15, 23, 42, 0.05)' : 'none',
  }
}
