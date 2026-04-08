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
    <div
      className="operational-analysis-risk-grid"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
    >
      <div
        style={{
          border: '1px solid var(--border-danger)',
          borderRadius: '20px',
          padding: '18px',
          background:
            'linear-gradient(180deg, var(--bg-danger) 0%, rgba(255,255,255,0.56) 100%)',
          boxShadow: 'var(--shadow-sm)',
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
          <AlertTriangle size={18} color="var(--text-danger)" />
          <h5 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Mayor Riesgo ({analysis.risk.needsAttention.length})
          </h5>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {analysis.risk.needsAttention.slice(0, 5).map(representative => (
            <div
              key={representative.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '10px',
                alignItems: 'center',
                fontSize: '13px',
                padding: '12px 14px',
                borderRadius: '16px',
                border: '1px solid rgba(192, 85, 61, 0.14)',
                background: 'rgba(255,255,255,0.58)',
              }}
            >
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{representative.name}</span>
              <span style={{ fontWeight: 800, color: 'var(--text-danger)' }}>
                {representative.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--border-success)',
          borderRadius: '20px',
          padding: '18px',
          background:
            'linear-gradient(180deg, var(--bg-success) 0%, rgba(255,255,255,0.56) 100%)',
          boxShadow: 'var(--shadow-sm)',
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
          <Award size={18} color="var(--text-success)" />
          <h5 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Mejor Desempeño ({analysis.risk.topPerformers.length})
          </h5>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {analysis.risk.topPerformers.slice(0, 5).map(representative => (
            <div
              key={representative.id}
              style={{
                fontSize: '13px',
                padding: '12px 14px',
                borderRadius: '16px',
                border: '1px solid rgba(47, 125, 96, 0.14)',
                background: 'rgba(255,255,255,0.58)',
                color: 'var(--text-main)',
                fontWeight: 600,
              }}
            >
              {representative.name}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 860px) {
          .operational-analysis-risk-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
