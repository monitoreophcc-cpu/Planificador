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
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          marginBottom: '8px',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--text-main)',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            padding: '10px 14px',
            border: '1px solid var(--shell-border)',
            borderRadius: '16px',
            background: lockKind
              ? 'rgba(159, 183, 198, 0.14)'
              : 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
            cursor: lockKind ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: lockKind ? 0.6 : 1,
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
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
              padding: '10px 14px',
              border: '1px solid var(--shell-border)',
              borderRadius: '16px',
              background:
                'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              cursor: 'pointer',
              fontSize: '14px',
              flex: 1,
              minWidth: '180px',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
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
              padding: '10px 14px',
              border: '1px solid var(--shell-border)',
              borderRadius: '16px',
              background:
                'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              cursor: 'pointer',
              fontSize: '14px',
              flex: 1,
              minWidth: '180px',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
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
            padding: '10px 14px',
            border: '1px solid var(--shell-border)',
            borderRadius: '16px',
            background:
              'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {lockKind && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          El tipo de período se hereda del bloque base para mantener la comparación consistente.
        </div>
      )}
    </div>
  )
}
