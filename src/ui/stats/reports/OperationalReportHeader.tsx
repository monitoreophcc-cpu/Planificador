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
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
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
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
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
              padding: '8px 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              background: 'var(--bg-panel)',
              cursor: 'pointer',
              fontSize: '14px',
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
