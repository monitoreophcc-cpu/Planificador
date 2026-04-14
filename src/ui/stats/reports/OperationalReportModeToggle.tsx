'use client'

import type { CSSProperties } from 'react'

interface OperationalReportModeToggleProps {
  mode: 'INSTITUTIONAL' | 'ANALYSIS'
  onChange: (mode: 'INSTITUTIONAL' | 'ANALYSIS') => void
}

export function OperationalReportModeToggle({
  mode,
  onChange,
}: OperationalReportModeToggleProps) {
  const buttonStyle = (
    currentMode: 'INSTITUTIONAL' | 'ANALYSIS'
  ): CSSProperties => ({
    padding: '9px 14px',
    border: `1px solid ${mode === currentMode ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
    borderRadius: '14px',
    background:
      mode === currentMode
        ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
        : 'transparent',
    color: mode === currentMode ? 'var(--accent-strong)' : 'var(--text-muted)',
    fontWeight: mode === currentMode ? 700 : 500,
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: mode === currentMode ? 'var(--shadow-sm)' : 'none',
  })

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '6px',
        background: 'var(--surface-tint)',
        borderRadius: '18px',
        border: '1px solid var(--shell-border)',
        width: 'fit-content',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      }}
    >
      <button
        onClick={() => onChange('INSTITUTIONAL')}
        style={buttonStyle('INSTITUTIONAL')}
      >
        ● Reporte Operativo
      </button>
      <button
        onClick={() => onChange('ANALYSIS')}
        style={buttonStyle('ANALYSIS')}
      >
        ○ Comparar períodos
      </button>
    </div>
  )
}
