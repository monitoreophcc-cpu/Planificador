'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { HistoryEvent } from '@/domain/types'

export function SettingsHistoryItem({ item }: { item: HistoryEvent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#4b5563',
            background: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {item.category}
        </span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          {format(parseISO(item.timestamp), 'd MMM yyyy, HH:mm', { locale: es })}
        </span>
      </div>
      <div
        style={{
          fontWeight: 600,
          color: '#111827',
          fontSize: '14px',
          marginTop: '4px',
        }}
      >
        {item.title}
      </div>
      {item.description && (
        <div style={{ fontSize: '13px', color: '#4b5563' }}>
          {item.description}
        </div>
      )}
      {(item.subject || item.impact) && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            fontSize: '12px',
            marginTop: '4px',
            color: '#6b7280',
          }}
        >
          {item.subject && <span>👤 {item.subject}</span>}
          {item.impact && <span>⚡ {item.impact}</span>}
        </div>
      )}
    </div>
  )
}
