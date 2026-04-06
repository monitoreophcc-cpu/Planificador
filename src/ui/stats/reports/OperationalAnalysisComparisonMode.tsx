'use client'

import type { ComparisonMode } from '@/domain/analysis/analysisTypes'

interface OperationalAnalysisComparisonModeProps {
  comparisonMode: ComparisonMode
  onChange: (value: ComparisonMode) => void
}

export function OperationalAnalysisComparisonMode({
  comparisonMode,
  onChange,
}: OperationalAnalysisComparisonModeProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 500,
          fontSize: '14px',
        }}
      >
        Comparar con:
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            value="PREVIOUS"
            checked={comparisonMode === 'PREVIOUS'}
            onChange={() => onChange('PREVIOUS')}
          />
          <span style={{ fontSize: '14px' }}>Período anterior</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            value="YEAR_AGO"
            checked={comparisonMode === 'YEAR_AGO'}
            onChange={() => onChange('YEAR_AGO')}
          />
          <span style={{ fontSize: '14px' }}>Mismo período año anterior</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            value="CUSTOM"
            checked={comparisonMode === 'CUSTOM'}
            onChange={() => onChange('CUSTOM')}
          />
          <span style={{ fontSize: '14px' }}>Otro período</span>
        </label>
      </div>
    </div>
  )
}
