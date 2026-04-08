'use client'

import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalAnalysisComparisonTable } from './OperationalAnalysisComparisonTable'
import { OperationalAnalysisExecutivePanel } from './OperationalAnalysisExecutivePanel'
import { OperationalAnalysisReading } from './OperationalAnalysisReading'
import { OperationalAnalysisRiskPanels } from './OperationalAnalysisRiskPanels'
import { OperationalAnalysisShiftCards } from './OperationalAnalysisShiftCards'

interface OperationalAnalysisResultsProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisResults({
  analysis,
}: OperationalAnalysisResultsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          padding: '20px',
          borderRadius: '22px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 60%, rgba(var(--accent-rgb), 0.06) 100%)',
          boxShadow: 'var(--shadow-sm)',
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
          Resultado del análisis
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
          Análisis: {analysis.base.period.label}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
          Comparado con: <strong>{analysis.compared.period.label}</strong>
        </p>
      </div>

      <OperationalAnalysisExecutivePanel analysis={analysis} />
      <OperationalAnalysisComparisonTable analysis={analysis} />
      <OperationalAnalysisShiftCards analysis={analysis} />
      <OperationalAnalysisRiskPanels analysis={analysis} />
      <OperationalAnalysisReading reading={analysis.reading} />
    </div>
  )
}
