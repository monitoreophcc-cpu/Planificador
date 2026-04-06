'use client'

import type { PeriodSelection } from './operationalAnalysisViewHelpers'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const QUARTERS = [
  { value: 1, label: 'Ene–Mar' },
  { value: 2, label: 'Abr–Jun' },
  { value: 3, label: 'Jul–Sep' },
  { value: 4, label: 'Oct–Dic' },
]

interface OperationalAnalysisPeriodSelectorProps {
  label: string
  value: PeriodSelection
  onChange: (value: PeriodSelection) => void
  lockKind?: boolean
}

export function OperationalAnalysisPeriodSelector({
  label,
  value,
  onChange,
  lockKind = false,
}: OperationalAnalysisPeriodSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

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
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={value.kind}
          onChange={event =>
            onChange({
              ...value,
              kind: event.target.value as 'MONTH' | 'QUARTER',
            })
          }
          disabled={lockKind}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            background: lockKind ? '#f3f4f6' : 'var(--bg-panel)',
            cursor: lockKind ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: lockKind ? 0.6 : 1,
          }}
        >
          <option value="MONTH">Mes</option>
          <option value="QUARTER">Trimestre</option>
        </select>

        {value.kind === 'MONTH' && (
          <select
            value={value.month ?? 0}
            onChange={event => {
              const month = Math.max(0, Math.min(11, Number(event.target.value)))
              onChange({ ...value, month })
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              background: 'var(--bg-panel)',
              cursor: 'pointer',
              fontSize: '14px',
              flex: 1,
            }}
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        )}

        {value.kind === 'QUARTER' && (
          <select
            value={value.quarter ?? 1}
            onChange={event =>
              onChange({
                ...value,
                quarter: Number(event.target.value) as 1 | 2 | 3 | 4,
              })
            }
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              background: 'var(--bg-panel)',
              cursor: 'pointer',
              fontSize: '14px',
              flex: 1,
            }}
          >
            {QUARTERS.map(quarter => (
              <option key={quarter.value} value={quarter.value}>
                {quarter.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={value.year}
          onChange={event =>
            onChange({
              ...value,
              year: Number(event.target.value),
            })
          }
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            background: 'var(--bg-panel)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
