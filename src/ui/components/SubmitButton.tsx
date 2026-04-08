'use client'

import React from 'react'
import { Loader2, Check, AlertTriangle } from 'lucide-react'

type Props = {
  state: 'idle' | 'loading' | 'success' | 'error'
  label?: string
  disabled?: boolean
}

function getBaseStyle(): React.CSSProperties {
  return {
    width: '100%',
    minHeight: '48px',
    padding: '12px 16px',
    borderRadius: '16px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(10px)',
  }
}

export function SubmitButton({ state, label = 'Registrar', disabled = false }: Props) {
  const baseStyle = getBaseStyle()

  if (disabled) {
    return (
      <button
        type="submit"
        disabled
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--surface-veil) 100%)',
          color: 'var(--text-faint)',
          borderColor: 'var(--border-subtle)',
          cursor: 'not-allowed',
          boxShadow: 'none',
        }}
      >
        {label}
      </button>
    )
  }

  if (state === 'loading') {
    return (
      <button
        type="submit"
        disabled
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--surface-veil) 100%)',
          color: 'var(--text-muted)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <Loader2 className="animate-spin" size={16} />
        Procesando...
      </button>
    )
  }

  if (state === 'success') {
    return (
      <button
        type="submit"
        disabled
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, var(--success) 0%, var(--text-success) 160%)',
          color: 'var(--text-on-accent)',
          borderColor: 'rgba(47, 125, 96, 0.28)',
          boxShadow: '0 18px 30px rgba(47, 125, 96, 0.18)',
        }}
      >
        <Check size={18} /> Guardado
      </button>
    )
  }

  if (state === 'error') {
    return (
      <button
        type="submit"
        disabled
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, var(--danger) 0%, var(--text-danger) 160%)',
          color: 'var(--text-on-accent)',
          borderColor: 'rgba(192, 85, 61, 0.24)',
          boxShadow: '0 18px 30px rgba(192, 85, 61, 0.18)',
        }}
      >
        <AlertTriangle size={18} /> Error
      </button>
    )
  }

  return (
    <button
      type="submit"
      style={{
        ...baseStyle,
        background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
        color: 'var(--text-on-accent)',
        borderColor: 'rgba(var(--accent-rgb), 0.2)',
        boxShadow: '0 18px 30px rgba(var(--accent-rgb), 0.2)',
      }}
    >
      {label}
    </button>
  )
}
