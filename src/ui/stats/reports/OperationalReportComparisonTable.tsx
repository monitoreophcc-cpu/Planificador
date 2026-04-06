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

function DeltaBadge({ value, inverse }: { value: number; inverse?: boolean }) {
  const isPositiveOutcome = inverse ? value > 0 : value < 0
  const color = isPositiveOutcome ? '#059669' : '#b91c1c'
  const Icon = isPositiveOutcome ? TrendingDown : TrendingUp

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
      <Icon size={16} />
      <span style={{ fontWeight: 700 }}>
        {value > 0 ? '+' : ''}
        {value}
      </span>
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
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        background: 'var(--bg-panel)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            Comparación Operativa
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCompareMode('PREVIOUS')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                border: '1px solid var(--border-strong)',
                borderRadius: '4px',
                background: compareMode === 'PREVIOUS' ? 'var(--text-main)' : 'transparent',
                color: compareMode === 'PREVIOUS' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              vs Período Anterior
            </button>
            <button
              onClick={() => setCompareMode('YEAR_AGO')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                border: '1px solid var(--border-strong)',
                borderRadius: '4px',
                background: compareMode === 'YEAR_AGO' ? 'var(--text-main)' : 'transparent',
                color: compareMode === 'YEAR_AGO' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              vs Año Anterior
            </button>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <strong>Comparado con:</strong> {selectedComparison.period.label}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>
              Indicador
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
              Actual
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
              Comparado
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
              Δ
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map(row => (
            <tr key={row.key} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.label}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '16px', fontWeight: 700 }}>
                {currentMetrics[row.key]}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {selectedComparison.metrics[row.key]}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <DeltaBadge
                  value={selectedComparison.delta[row.key]}
                  inverse={row.inverse}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
