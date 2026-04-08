import type { ReactNode } from 'react'

type DailyLogSidebarStatusBadgeProps = {
  background: string
  bold?: boolean
  border?: string
  color: string
  icon: ReactNode
  label: string
  title: string
}

export function DailyLogSidebarStatusBadge({
  background,
  bold,
  border,
  color,
  icon,
  label,
  title,
}: DailyLogSidebarStatusBadgeProps) {
  return (
    <span
      title={title}
      style={{
        fontSize: '10px',
        background,
        color,
        padding: '3px 7px',
        borderRadius: '999px',
        fontWeight: bold ? 700 : 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'help',
        border,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {icon} {label}
    </span>
  )
}
