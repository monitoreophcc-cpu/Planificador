'use client'

import { FileText } from 'lucide-react'
import type { PeriodKind } from '@/domain/reports/operationalTypes'

const PERIOD_OPTIONS: Array<{ label: string; value: PeriodKind }> = [
  { label: 'Mes Actual', value: 'MONTH' },
  { label: 'Trimestre Actual', value: 'QUARTER' },
]

interface OperationalReportHeaderProps {
  currentPeriodLabel: string
  onExport: () => void
  onPeriodChange: (kind: PeriodKind) => void
}

export function OperationalReportHeader({
  currentPeriodLabel,
  onExport,
  onPeriodChange,
}: OperationalReportHeaderProps) {
  return (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
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
            Informe institucional
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Reporte Operativo
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Evaluación del período <strong>{currentPeriodLabel}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={onExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: '1px solid var(--shell-border)',
              borderRadius: '16px',
              background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
            title="Descargar PDF para Jefatura"
          >
            <FileText size={16} />
            Exportar PDF
          </button>
          <select
            onChange={event => onPeriodChange(event.target.value as PeriodKind)}
            defaultValue="MONTH"
            style={{
              padding: '10px 12px',
              border: '1px solid var(--shell-border)',
              borderRadius: '16px',
              background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
