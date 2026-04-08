'use client'

import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalDeltaBadge } from './OperationalDeltaBadge'
import { OPERATIONAL_COMPARISON_ROWS } from './operationalAnalysisResultsConfig'

interface OperationalAnalysisComparisonTableProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisComparisonTable({
  analysis,
}: OperationalAnalysisComparisonTableProps) {
  return (
    <div
      style={{
        border: '1px solid var(--shell-border)',
        borderRadius: '22px',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--shell-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(248,242,233,0.72) 100%)',
        }}
      >
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
          Comparación métrica
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
          Indicadores del período
        </div>
        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Contrasta el bloque base con el período comparado y revisa la variación en cada métrica.
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
              Base
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
              Comparado
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
              Δ
            </th>
          </tr>
        </thead>
        <tbody>
          {OPERATIONAL_COMPARISON_ROWS.map((row, index) => (
            <tr
              key={row.key}
              style={{
                borderTop:
                  index > 0 ? '1px solid rgba(202, 189, 168, 0.38)' : 'none',
              }}
            >
              <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                {row.label}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)' }}>
                {analysis.base.metrics[row.key]}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                {analysis.compared.metrics[row.key]}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                <OperationalDeltaBadge
                  value={analysis.compared.delta[row.key]}
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
