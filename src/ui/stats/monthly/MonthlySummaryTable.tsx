'use client'

import type { CSSProperties } from 'react'
import type {
  PersonMonthlySummary,
  RiskLevel,
} from '@/domain/analytics/types'

interface MonthlySummaryTableProps {
  data: PersonMonthlySummary[]
  onSelectRow: (person: PersonMonthlySummary) => void
}

const headerStyle: CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  opacity: 0.7,
}

const cellStyle: CSSProperties = {
  padding: '12px',
  borderTop: '1px solid #f3f4f6',
  fontSize: '14px',
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    danger: '#ef4444',
    warning: '#f59e0b',
    ok: '#10b981',
  }

  return (
    <div
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: colors[level],
        margin: '0 auto',
      }}
      title={level === 'danger' ? 'Riesgo' : level === 'warning' ? 'Atención' : 'OK'}
    />
  )
}

export function MonthlySummaryTable({
  data,
  onSelectRow,
}: MonthlySummaryTableProps) {
  const sortedData = [...data].sort((a, b) => b.totals.puntos - a.totals.puntos)

  return (
    <div
      style={{
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        background: 'var(--bg-panel)',
      }}
    >
      <style jsx global>{`
        .monthly-summary-row:hover {
          background-color: #f9fafb !important;
        }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            <th style={headerStyle}>Representante</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Puntos</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Ausencias</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Tardanzas</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Errores</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Estado</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(person => (
            <tr
              key={person.representativeId}
              className="monthly-summary-row"
              style={{
                background:
                  person.riskLevel === 'danger'
                    ? 'hsl(0,100%,98%)'
                    : person.riskLevel === 'warning'
                      ? 'hsl(45,100%,98%)'
                      : 'white',
              }}
            >
              <td style={{ ...cellStyle, fontWeight: 600, color: 'var(--text-main)' }}>
                {person.name}
              </td>
              <td
                style={{
                  ...cellStyle,
                  fontWeight: 700,
                  color: person.totals.puntos > 0 ? '#b91c1c' : '#374151',
                  textAlign: 'center',
                }}
              >
                {person.totals.puntos}
              </td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                {person.totals.ausencias}
              </td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                {person.totals.tardanzas}
              </td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                {person.totals.errores}
              </td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                <RiskBadge level={person.riskLevel} />
              </td>
              <td style={{ ...cellStyle, textAlign: 'center' }}>
                <button
                  onClick={() => onSelectRow(person)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
