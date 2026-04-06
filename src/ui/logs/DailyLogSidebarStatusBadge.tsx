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
        padding: '2px 6px',
        borderRadius: '4px',
        fontWeight: bold ? 700 : 600,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        cursor: 'help',
        border,
      }}
    >
      {icon} {label}
    </span>
  )
}
