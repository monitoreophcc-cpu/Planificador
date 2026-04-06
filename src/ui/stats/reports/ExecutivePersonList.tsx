import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ExecutivePersonSummary } from '@/domain/executiveReport/types'

interface ExecutivePersonListProps {
  title: string
  data: ExecutivePersonSummary[]
  Icon: LucideIcon
  variant: 'success' | 'danger'
}

const cellStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: '14px',
  borderTop: '1px solid #f3f4f6',
}

export function ExecutivePersonList({
  title,
  data,
  Icon,
  variant,
}: ExecutivePersonListProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        background: 'var(--bg-panel)',
        height: '100%',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          color: variant === 'success' ? '#059669' : '#b91c1c',
        }}
      >
        <Icon size={20} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          {title} ({data.length})
        </h3>
      </header>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {data.map(representative => (
              <tr key={representative.repId}>
                <td style={{ ...cellStyle, fontWeight: 500 }}>
                  {representative.name}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: 'right',
                    fontWeight: 700,
                    color:
                      variant === 'danger' && representative.points > 0
                        ? '#b91c1c'
                        : '#374151',
                  }}
                >
                  {representative.points > 0 ? `${representative.points} pts` : ''}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    ...cellStyle,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
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
    </div>
  )
}
