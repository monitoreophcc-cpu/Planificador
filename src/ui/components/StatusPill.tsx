'use client'

import React from 'react'

export type StatusVariant = 'ok' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusPillProps {
  label: string
  value?: string | number
  variant?: StatusVariant
  className?: string
}

const VARIANT_STYLES: Record<
  StatusVariant,
  { background: string; color: string; border: string; dot: string; valueSurface: string }
> = {
  ok: {
    background: 'var(--bg-success)',
    color: 'var(--text-success)',
    border: 'var(--border-success)',
    dot: 'var(--success)',
    valueSurface: 'rgba(47, 125, 96, 0.12)',
  },
  warning: {
    background: 'var(--bg-warning)',
    color: 'var(--text-warning)',
    border: 'var(--border-warning)',
    dot: 'var(--warning)',
    valueSurface: 'rgba(176, 108, 16, 0.12)',
  },
  danger: {
    background: 'var(--bg-danger)',
    color: 'var(--text-danger)',
    border: 'var(--border-danger)',
    dot: 'var(--danger)',
    valueSurface: 'rgba(192, 85, 61, 0.12)',
  },
  info: {
    background: 'var(--accent-soft)',
    color: 'var(--accent-strong)',
    border: 'rgba(var(--accent-rgb), 0.18)',
    dot: 'var(--accent)',
    valueSurface: 'rgba(var(--accent-rgb), 0.12)',
  },
  neutral: {
    background: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    border: 'var(--border-subtle)',
    dot: 'var(--text-faint)',
    valueSurface: 'rgba(95, 109, 125, 0.1)',
  },
}

export function StatusPill({
  label,
  value,
  variant = 'neutral',
  className = '',
}: StatusPillProps) {
  const style = VARIANT_STYLES[variant]

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: 32,
    padding: '6px 11px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '0.01em',
    border: `1px solid ${style.border}`,
    background: `linear-gradient(180deg, ${style.background} 0%, var(--surface-veil) 100%)`,
    color: style.color,
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(8px)',
  }

  return (
    <span style={baseStyle} className={className}>
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '999px',
          background: style.dot,
          boxShadow: `0 0 0 4px ${style.valueSurface}`,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
      {value !== undefined && (
        <span
          style={{
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '999px',
            background: style.valueSurface,
            color: style.color,
          }}
        >
          {value}
        </span>
      )}
    </span>
  )
}
