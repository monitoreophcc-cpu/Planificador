'use client'

import { AlertTriangle, Award } from 'lucide-react'
import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'

interface OperationalAnalysisRiskPanelsProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisRiskPanels({
  analysis,
}: OperationalAnalysisRiskPanelsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div
        style={{
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          padding: '16px',
          background: '#fef2f2',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
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
  )
}
