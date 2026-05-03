'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { OperationalReport } from '@/domain/reports/operationalTypes'

type ComparisonMode = 'PREVIOUS' | 'YEAR_AGO'

const COMPARISON_ROWS = [
  { label: 'Incidencias', key: 'incidents', inverse: true },
  { label: 'Puntos', key: 'points', inverse: true },
  { label: 'Ausencias', key: 'absences', inverse: true },
  { label: 'Licencias', key: 'licenses', inverse: true },
] as const

function ChangeBadge({ value, inverse }: { value: number; inverse?: boolean }) {
  const isNeutral = value === 0
  const isPositiveOutcome = inverse ? value < 0 : value > 0
  const color = isNeutral
    ? 'var(--text-muted)'
    : isPositiveOutcome
      ? 'var(--text-success)'
      : 'var(--text-danger)'
  const Icon = isNeutral ? TrendingUp : isPositiveOutcome ? TrendingDown : TrendingUp
  const label = isNeutral
    ? 'Igual'
    : `${isPositiveOutcome ? 'Mejoro' : 'Subio'} ${Math.abs(value)}`

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color,
        background: isNeutral
          ? 'rgba(159, 183, 198, 0.14)'
          : isPositiveOutcome
            ? 'var(--bg-success)'
            : 'var(--bg-danger)',
        border: `1px solid ${
          isNeutral
            ? 'var(--shell-border)'
            : isPositiveOutcome
              ? 'var(--border-success)'
              : 'var(--border-danger)'
        }`,
        borderRadius: '999px',
        padding: '6px 10px',
        fontSize: '12px',
      }}
    >
      <Icon size={16} />
      <span style={{ fontWeight: 700 }}>{label}</span>
    </div>
  )
}

interface OperationalReportComparisonTableProps {
  comparison: OperationalReport['comparison']
  currentMetrics: OperationalReport['current']['metrics']
}

export function OperationalReportComparisonTable({
  comparison,
  currentMetrics,
}: OperationalReportComparisonTableProps) {
  const [compareMode, setCompareMode] = useState<ComparisonMode>('PREVIOUS')
  const selectedComparison =
    compareMode === 'PREVIOUS' ? comparison.previous : comparison.yearAgo

  return (
    <div
      style={{
        border: '1px solid var(--shell-border)',
        borderRadius: '22px',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--shell-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(248,242,233,0.72) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
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
              Lectura comparada
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              Como va el periodo
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Compara este periodo con otro para ver rapido si subio, bajo o se mantuvo igual.
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              gap: '8px',
              padding: '6px',
              borderRadius: '999px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.46)',
              boxShadow: 'var(--shadow-sm)',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setCompareMode('PREVIOUS')}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                border: '1px solid transparent',
                borderRadius: '999px',
                background:
                  compareMode === 'PREVIOUS'
                    ? 'var(--accent)'
                    : 'transparent',
                color:
                  compareMode === 'PREVIOUS'
                    ? 'var(--text-on-accent)'
                    : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Periodo anterior
            </button>
            <button
              onClick={() => setCompareMode('YEAR_AGO')}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                border: '1px solid transparent',
                borderRadius: '999px',
                background:
                  compareMode === 'YEAR_AGO'
                    ? 'var(--accent)'
                    : 'transparent',
                color:
                  compareMode === 'YEAR_AGO'
                    ? 'var(--text-on-accent)'
                    : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Mismo periodo del ano pasado
            </button>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong>Comparado con:</strong> {selectedComparison.period.label}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--shell-border)' }}>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  background: 'rgba(244, 238, 228, 0.7)',
                }}
              >
                Indicador
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  background: 'rgba(244, 238, 228, 0.7)',
                }}
              >
                Este periodo
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  background: 'rgba(244, 238, 228, 0.7)',
                }}
              >
                Periodo comparado
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  background: 'rgba(244, 238, 228, 0.7)',
                }}
              >
                Cambio
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map(row => (
              <tr key={row.key} style={{ borderBottom: '1px solid rgba(202, 189, 168, 0.38)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {row.label}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {currentMetrics[row.key]}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {selectedComparison.metrics[row.key]}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <ChangeBadge
                    value={selectedComparison.delta[row.key]}
                    inverse={row.inverse}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
