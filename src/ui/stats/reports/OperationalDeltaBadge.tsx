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
  const isPositiveOutcome = inverse ? value > 0 : value < 0
  const color = isPositiveOutcome ? '#059669' : '#b91c1c'
  const Icon = isPositiveOutcome ? TrendingDown : TrendingUp

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color }}>
      <Icon size={16} />
      <span style={{ fontWeight: 700 }}>
        {value > 0 ? '+' : ''}
        {value}
      </span>
    </div>
  )
}
