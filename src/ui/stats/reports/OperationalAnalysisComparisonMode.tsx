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
  const options: Array<{
    value: ComparisonMode
    label: string
    description: string
  }> = [
    {
      value: 'PREVIOUS',
      label: 'Período anterior',
      description: 'Compara con el bloque inmediato anterior.',
    },
    {
      value: 'YEAR_AGO',
      label: 'Año anterior',
      description: 'Mismo tramo del año previo.',
    },
    {
      value: 'CUSTOM',
      label: 'Otro período',
      description: 'Elige manualmente con qué contrastar.',
    },
  ]

  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          marginBottom: '8px',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--text-main)',
        }}
      >
        Comparar con:
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}
      >
        {options.map(option => {
          const isActive = comparisonMode === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: '16px',
                border: isActive
                  ? '1px solid rgba(var(--accent-rgb), 0.22)'
                  : '1px solid rgba(202, 189, 168, 0.42)',
                background: isActive
                  ? 'linear-gradient(180deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(255,255,255,0.64) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(248,242,233,0.34) 100%)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'transform 140ms ease, border-color 140ms ease',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isActive ? 'var(--accent)' : 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {option.label}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  lineHeight: 1.45,
                  color: 'var(--text-muted)',
                }}
              >
                {option.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
