// src/ui/stats/audit/AuditTable.tsx
'use client'

import { AuditEvent } from '@/domain/audit/types'
import { AuditRow } from './AuditRow'

interface Props {
  events: AuditEvent[]
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid var(--shell-border)',
  background: 'rgba(244, 238, 228, 0.7)',
}

export function AuditTable({ events }: Props) {
  if (events.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          background:
            'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
          borderRadius: '22px',
          border: '1px solid var(--shell-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        No hay movimientos del sistema registrados.
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--shell-border)',
        borderRadius: '22px',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--shell-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(248,242,233,0.72) 100%)',
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
          Registro reciente
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
          Movimientos recientes del sistema
        </div>
        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {events.length} evento(s) registrados para consulta histórica.
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Fecha</th>
            <th style={tableHeaderStyle}>Hecho por</th>
            <th style={tableHeaderStyle}>Cambio</th>
            <th style={tableHeaderStyle}>Registro</th>
            <th style={tableHeaderStyle}>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <AuditRow key={event.id} event={event} />
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
