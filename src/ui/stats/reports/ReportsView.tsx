'use client'

import React from 'react'

export function ReportsView() {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        borderRadius: '22px',
        color: 'var(--text-muted)',
        border: '1px solid var(--shell-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '8px',
        }}
      >
        Próximamente
      </div>
      <h2 style={{ marginTop: 0, color: 'var(--text-main)' }}>Más comparativos</h2>
      <p>Esta sección todavía se está preparando.</p>
    </div>
  )
}
