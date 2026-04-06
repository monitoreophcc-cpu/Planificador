import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import type { PayrollRow } from '@/application/stats/getMonthlyPointsSummary'
import type { CSSProperties } from 'react'

interface PointsReportTableProps {
  data: PayrollRow[]
  title: string
  onCopy: (text: string, title: string) => void
}

const tableHeaderStyle: CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
}

const cellStyle: CSSProperties = {
  padding: '10px 12px',
  borderTop: '1px solid #f3f4f6',
  fontSize: '14px',
}

function generatePointsMatrix(data: PayrollRow[]): string {
  const valueOrBlank = (value: number) => (value === 0 ? '' : value)

  return data
    .map(row =>
      [
        valueOrBlank(row.tardanza),
        valueOrBlank(row.ausencia),
        valueOrBlank(row.errores),
        valueOrBlank(row.otros),
        row.salesTotal,
      ].join('\t')
    )
    .join('\n')
}

export function PointsReportTable({
  data,
  title,
  onCopy,
}: PointsReportTableProps) {
  return (
    <section>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onCopy(generatePointsMatrix(data), title)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '6px 12px',
              background: '#eef2ff',
              color: '#312e81',
              border: '1px solid #c7d2fe',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Download size={14} /> Copiar Puntos (para Excel)
          </button>
        </div>
      </header>
      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'var(--bg-panel)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={tableHeaderStyle}>Empleado</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                Tardanza
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                Ausencia
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>
                Errores
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Otros</th>
              <th
                style={{
                  ...tableHeaderStyle,
                  textAlign: 'right',
                  color: '#6366f1',
                }}
              >
                Ventas
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.repId}>
                <td style={{ ...cellStyle, fontWeight: 500 }}>{row.repName}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {row.tardanza > 0 ? row.tardanza : ''}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {row.ausencia > 0 ? row.ausencia : ''}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {row.errores > 0 ? row.errores : ''}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {row.otros > 0 ? row.otros : ''}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: 'right',
                    color: '#4f46e5',
                    fontWeight: 600,
                  }}
                >
                  {row.salesTotal > 0 ? formatCurrency(row.salesTotal) : ''}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: 'right',
                    fontWeight: 700,
                    color: row.total > 0 ? '#b91c1c' : '#1f2937',
                  }}
                >
                  {row.total}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...cellStyle,
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                  }}
                >
                  No hay representantes en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
