// src/ui/stats/audit/AuditRow.tsx
'use client'

import { AuditEvent } from '@/domain/audit/types'
import { AuditActionBadge } from './AuditActionBadge'
import { AuditDetail } from './AuditDetail'

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '13px',
  borderTop: '1px solid rgba(202, 189, 168, 0.38)',
  verticalAlign: 'top',
}

export function AuditRow({ event }: { event: AuditEvent }) {
  return (
    <tr className="audit-row">
      <style jsx global>{`
        .audit-row:hover {
          background-color: rgba(244, 238, 228, 0.72);
        }
      `}</style>
      <td style={{ ...cellStyle, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {new Date(event.timestamp).toLocaleString('es-ES', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </td>
      <td style={{ ...cellStyle, fontWeight: 500 }}>
        {typeof event.actor === 'string' ? event.actor : event.actor.name}
        {event.repId && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Representante: {event.repId}
          </div>
        )}
      </td>
      <td style={cellStyle}>
        <AuditActionBadge action={event.type || 'UNKNOWN'} />
      </td>
      <td style={cellStyle}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{event.type}</div>
        {event.repId && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {event.repId}
          </div>
        )}
      </td>
      <td style={{ ...cellStyle, fontSize: 12, color: 'var(--text-main)' }}>
        <AuditDetail event={event} />
      </td>
    </tr>
  )
}
