'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

interface OperationalDeltaBadgeProps {
  value: number
  inverse?: boolean
}

export function OperationalDeltaBadge({
  value,
  inverse,
}: OperationalDeltaBadgeProps) {
  const isNeutral = value === 0
  const isPositiveOutcome = inverse ? value < 0 : value > 0
  const color = isNeutral
    ? 'var(--text-muted)'
    : isPositiveOutcome
      ? 'var(--text-success)'
      : 'var(--text-danger)'
  const Icon = isNeutral ? TrendingUp : isPositiveOutcome ? TrendingDown : TrendingUp
  const label = isNeutral
    ? 'Igual'
    : `${isPositiveOutcome ? 'Mejoro' : 'Subio'} ${Math.abs(value)}`

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color,
        background: isNeutral
          ? 'rgba(159, 183, 198, 0.14)'
          : isPositiveOutcome
            ? 'var(--bg-success)'
            : 'var(--bg-danger)',
        border: `1px solid ${
          isNeutral
            ? 'var(--shell-border)'
            : isPositiveOutcome
              ? 'var(--border-success)'
              : 'var(--border-danger)'
        }`,
        borderRadius: '999px',
        padding: '6px 10px',
        fontSize: '12px',
      }}
    >
      <Icon size={16} />
      <span style={{ fontWeight: 700 }}>{label}</span>
    </div>
  )
}
