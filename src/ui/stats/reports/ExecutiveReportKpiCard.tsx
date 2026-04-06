import type { ElementType } from 'react'

interface ExecutiveReportKpiCardProps {
  label: string
  value: string | number
  Icon: ElementType
}

export function ExecutiveReportKpiCard({
  label,
  value,
  Icon,
}: ExecutiveReportKpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-main)',
        }}
      >
        {value}
      </div>
    </div>
  )
}
