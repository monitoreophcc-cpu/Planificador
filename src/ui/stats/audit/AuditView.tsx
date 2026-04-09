/**
 * ⚠️ AUDIT VIEW (READ-ONLY)
 * This view renders immutable audit events.
 * No filtering, grouping or derivation is allowed here.
 * Any change requires audit tests.
 */
'use client'

import React from 'react'
import { Filter, Calendar, User, Search } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { AuditTable } from './AuditTable'

const inputStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid var(--shell-border)',
  borderRadius: '16px',
  padding: '10px 12px',
  fontSize: '14px',
  background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
  opacity: 0.7,
  boxShadow: 'var(--shadow-sm)',
}

export function AuditView() {
  const auditLog = useAppStore(state => state.auditLog)

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)',
      }}
    >
      <header
        style={{
          padding: '20px',
          borderRadius: '22px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 60%, rgba(var(--accent-rgb), 0.06) 100%)',
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
          Registro del sistema
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
          Cambios guardados automáticamente
        </h2>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Consulta acciones y cambios registrados por la aplicación.
        </p>
      </header>

      {/* --- Filtros (UI only placeholder) --- */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={inputStyle}>
          <Calendar size={16} />
          <span>Rango de fechas</span>
        </div>
        <div style={inputStyle}>
          <Filter size={16} />
          <span>Tipo de acción</span>
        </div>
        <div style={inputStyle}>
          <User size={16} />
          <span>Actor</span>
        </div>
        <div style={{ flex: 1, ...inputStyle }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por acción, registro o detalle..."
            disabled
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              color: 'var(--text-muted)',
              cursor: 'not-allowed',
            }}
          />
        </div>
      </div>

      <AuditTable events={auditLog} />
    </div>
  )
}
