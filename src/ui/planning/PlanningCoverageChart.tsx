'use client'

import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import type { DayInfo, ISODate } from '@/domain/types'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  formatCompactWeekLabel,
  getCoverageTone,
} from './planningOperationalMetrics'

interface PlanningCoverageChartProps {
  coverageData: Record<ISODate, EffectiveCoverageResult>
  onNavigateToSettings: () => void
  weekDays: DayInfo[]
}

function parseISODate(date: ISODate) {
  return new Date(`${date}T12:00:00Z`)
}

function toneColor(tone: 'success' | 'warning' | 'danger' | 'neutral') {
  switch (tone) {
    case 'success':
      return PLANNER_THEME.success
    case 'warning':
      return PLANNER_THEME.warning
    case 'danger':
      return PLANNER_THEME.danger
    default:
      return PLANNER_THEME.textMuted
  }
}

export function PlanningCoverageChart({
  coverageData,
  onNavigateToSettings,
  weekDays,
}: PlanningCoverageChartProps) {
  const compactLabel = formatCompactWeekLabel(weekDays)
  const coverageEntries = weekDays
    .map(day => ({ day, coverage: coverageData[day.date] }))
    .filter(entry => entry.coverage)
  const hasCoverageRules = coverageEntries.some(
    entry => (entry.coverage?.required ?? 0) > 0
  )
  const maxCoverage = Math.max(
    1,
    ...coverageEntries.map(entry =>
      Math.max(entry.coverage?.actual ?? 0, entry.coverage?.required ?? 0)
    )
  )
  const todayIso = format(new Date(), 'yyyy-MM-dd') as ISODate

  if (!hasCoverageRules) {
    return (
      <section
        style={{
          background:
            'linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(255, 255, 255, 0.72) 18%, rgba(255, 255, 255, 0.72) 82%, rgba(var(--accent-warm-rgb), 0.14) 100%)',
          borderRadius: '20px',
          border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
          boxShadow: PLANNER_THEME.shellShadow,
          overflow: 'hidden',
          padding: '1px',
        }}
      >
        <div
          style={{
            background: PLANNER_THEME.surfacePanel,
            borderRadius: '19px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              padding: '14px 18px',
              borderBottom: `1px solid ${PLANNER_THEME.border}`,
            }}
          >
            <div
              style={{
                color: PLANNER_THEME.text,
                fontSize: '0.98rem',
                fontWeight: 700,
              }}
            >
              Cobertura diaria — {compactLabel}
            </div>
            <button
              onClick={onNavigateToSettings}
              style={{
                border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
                background: PLANNER_THEME.controlBg,
                color: PLANNER_THEME.controlText,
                cursor: 'pointer',
                fontWeight: 600,
                borderRadius: '999px',
                padding: '8px 12px',
              }}
            >
              Ver ajustes
            </button>
          </div>
          <div
            style={{
              padding: '20px 18px',
              color: PLANNER_THEME.textMuted,
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>Sin reglas de cobertura activas para este turno.</div>
            <div style={{ fontSize: '0.92rem', color: PLANNER_THEME.textFaint }}>
              Define mínimos por día o turno para activar el análisis semanal.
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      style={{
        background:
          'linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(255, 255, 255, 0.72) 18%, rgba(255, 255, 255, 0.72) 82%, rgba(var(--accent-warm-rgb), 0.14) 100%)',
        borderRadius: '20px',
        border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
        boxShadow: PLANNER_THEME.shellShadow,
        overflow: 'hidden',
        padding: '1px',
      }}
    >
      <div
        style={{
          background: PLANNER_THEME.surfacePanel,
          borderRadius: '19px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: `1px solid ${PLANNER_THEME.border}`,
            flexWrap: 'wrap',
          }}
      >
        <div
          style={{
            color: PLANNER_THEME.text,
            fontSize: '0.94rem',
            fontWeight: 700,
          }}
        >
          Cobertura diaria — {compactLabel}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onNavigateToSettings}
            style={{
              border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
              background: PLANNER_THEME.controlBg,
              color: PLANNER_THEME.controlText,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              padding: '6px 10px',
              borderRadius: '999px',
            }}
          >
            Abrir ajustes
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px 8px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '8px',
            alignItems: 'end',
          }}
        >
          {coverageEntries.map(({ day, coverage }) => {
            const tone = getCoverageTone(coverage)
            const actual = coverage?.actual ?? 0
            const required = coverage?.required ?? 0
            const barHeight = Math.max(
              8,
              Math.round((actual / maxCoverage) * 36)
            )
            const dayLabel = format(parseISODate(day.date), 'eee d', {
              locale: es,
            }).replace('.', '')
            const isToday = day.date === todayIso

            return (
              <div
                key={day.date}
                title={`${actual} en turno · mínimo ${required}`}
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    minHeight: '18px',
                    color: toneColor(tone),
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '4px',
                    textAlign: 'center',
                  }}
                >
                  {actual}
                </div>
                <div
                  style={{
                    height: '44px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '92px',
                      height: `${barHeight}px`,
                      borderRadius: '999px',
                      background: toneColor(tone),
                      border: '2px solid transparent',
                      boxShadow: `0 10px 24px ${tone === 'danger' ? 'rgba(204, 71, 71, 0.18)' : tone === 'warning' ? 'rgba(213, 146, 34, 0.18)' : 'rgba(32, 195, 139, 0.16)'}`,
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    color: isToday ? 'var(--color-primary)' : PLANNER_THEME.textMuted,
                    fontWeight: isToday ? 600 : 500,
                    fontSize: '12px',
                    opacity: 0.8,
                  }}
                >
                  <span>{dayLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '8px 16px 10px',
          borderTop: `1px solid ${PLANNER_THEME.border}`,
          color: PLANNER_THEME.textMuted,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '0.78rem',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: PLANNER_THEME.success,
              }}
            />
            OK (&gt; mínimo)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: PLANNER_THEME.warning,
              }}
            />
            Justo (= mínimo)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: PLANNER_THEME.danger,
              }}
            />
            Bajo (&lt; mínimo)
          </span>
        </div>
      </div>
      </div>
    </section>
  )
}
