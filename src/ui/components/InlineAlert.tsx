'use client'

import React from 'react'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface InlineAlertProps {
  variant: 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function InlineAlert({ variant, children }: InlineAlertProps) {
  const styles = {
    warning: {
      label: 'Atencion',
      background: 'var(--bg-warning)',
      borderColor: 'var(--border-warning)',
      color: 'var(--text-warning)',
      icon: <AlertTriangle size={18} />,
      iconSurface: 'rgba(176, 108, 16, 0.12)',
    },
    error: {
      label: 'Bloqueo',
      background: 'var(--bg-danger)',
      borderColor: 'var(--border-danger)',
      color: 'var(--text-danger)',
      icon: <AlertCircle size={18} />,
      iconSurface: 'rgba(192, 85, 61, 0.12)',
    },
    info: {
      label: 'Contexto',
      background: 'var(--accent-soft)',
      borderColor: 'rgba(var(--accent-rgb), 0.18)',
      color: 'var(--accent-strong)',
      icon: <Info size={18} />,
      iconSurface: 'rgba(var(--accent-rgb), 0.12)',
    },
  }

  const style = styles[variant]

  return (
    <div
      role={variant === 'info' ? 'status' : 'alert'}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '18px',
        background: `linear-gradient(180deg, ${style.background} 0%, var(--surface-veil) 100%)`,
        border: `1px solid ${style.borderColor}`,
        color: style.color,
        fontSize: '13px',
        alignItems: 'flex-start',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          marginTop: '1px',
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          background: style.iconSurface,
          border: `1px solid ${style.borderColor}`,
        }}
      >
        {style.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            marginBottom: 3,
            opacity: 0.9,
          }}
        >
          {style.label}
        </div>
        <div style={{ lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  )
}
