'use client'

import {
  AlertTriangle,
  Award,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'

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

interface OperationalAnalysisResultsProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisResults({
  analysis,
}: OperationalAnalysisResultsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
          Análisis: {analysis.base.period.label}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
          Comparado con: <strong>{analysis.compared.period.label}</strong>
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>
                Indicador
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                Base
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                Comparado
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                Δ
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, index) => (
              <tr
                key={row.key}
                style={{
                  borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <td style={{ padding: '12px', fontSize: '14px' }}>{row.label}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                  {analysis.base.metrics[row.key]}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {analysis.compared.metrics[row.key]}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <DeltaBadge
                    value={analysis.compared.delta[row.key]}
                    inverse={row.inverse}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>
          Comparación por Turnos
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {analysis.shifts.map(shift => (
            <div
              key={shift.shift}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h5 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
                Turno {shift.shift === 'DAY' ? 'Día' : 'Noche'}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Incidencias:</span>
                  <span>
                    <strong>{shift.base.incidents}</strong> vs {shift.compared.incidents}
                    <span style={{ marginLeft: '8px' }}>
                      <DeltaBadge value={shift.delta.incidents} inverse />
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Puntos:</span>
                  <span>
                    <strong>{shift.base.points}</strong> vs {shift.compared.points}
                    <span style={{ marginLeft: '8px' }}>
                      <DeltaBadge value={shift.delta.points} inverse />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div
          style={{
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            padding: '16px',
            background: '#fef2f2',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="#b91c1c" />
            <h5 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
              Mayor Riesgo ({analysis.risk.needsAttention.length})
            </h5>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.risk.needsAttention.slice(0, 5).map(representative => (
              <div
                key={representative.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                }}
              >
                <span>{representative.name}</span>
                <span style={{ fontWeight: 700, color: '#b91c1c' }}>
                  {representative.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            border: '1px solid #d1fae5',
            borderRadius: '8px',
            padding: '16px',
            background: '#f0fdf4',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Award size={18} color="#059669" />
            <h5 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
              Mejor Desempeño ({analysis.risk.topPerformers.length})
            </h5>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.risk.topPerformers.slice(0, 5).map(representative => (
              <div key={representative.id} style={{ fontSize: '13px' }}>
                {representative.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#374151',
        }}
      >
        <strong>Lectura:</strong> {analysis.reading}
      </div>
    </div>
  )
}
