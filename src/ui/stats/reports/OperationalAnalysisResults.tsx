'use client'

import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalAnalysisComparisonTable } from './OperationalAnalysisComparisonTable'
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
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
          Análisis: {analysis.base.period.label}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
          Comparado con: <strong>{analysis.compared.period.label}</strong>
        </p>
      </div>

      <OperationalAnalysisComparisonTable analysis={analysis} />
      <OperationalAnalysisShiftCards analysis={analysis} />
      <OperationalAnalysisRiskPanels analysis={analysis} />
      <OperationalAnalysisReading reading={analysis.reading} />
    </div>
  )
}
