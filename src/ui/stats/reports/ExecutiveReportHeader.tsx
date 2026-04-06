import type { ChangeEvent } from 'react'
import {
  EXECUTIVE_REPORT_PERIOD_OPTIONS,
  type ExecutiveReportPeriod,
} from './useExecutiveReportView'

interface ExecutiveReportHeaderProps {
  onPeriodChange: (period: ExecutiveReportPeriod) => void
  period: ExecutiveReportPeriod
}

export function ExecutiveReportHeader({
  onPeriodChange,
  period,
}: ExecutiveReportHeaderProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    onPeriodChange(value === 'quarter' ? 'quarter' : Number(value))
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            margin: 0,
          }}
        >
          Reporte Ejecutivo de Desempeño
        </h2>
        <p
          style={{
            margin: '4px 0 0',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}
        >
          Vista panorámica de incidencias y rendimiento del equipo.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <select
          onChange={handleChange}
          value={period}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            background: 'var(--bg-panel)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {EXECUTIVE_REPORT_PERIOD_OPTIONS.map(option => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
