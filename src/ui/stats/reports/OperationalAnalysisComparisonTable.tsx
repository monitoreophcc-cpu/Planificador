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
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Indicador
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Base
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Comparado
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '13px',
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
  )
}
