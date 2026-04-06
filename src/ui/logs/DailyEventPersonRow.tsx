'use client'

import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import type { PersonInGroup } from './dailyEventsGrouping'

export const PersonRow = memo(function PersonRow({
  person,
  onDeleteGroup,
  onDeleteSingle,
  canDelete,
}: {
  person: PersonInGroup
  onDeleteGroup: (ids: string[]) => void
  onDeleteSingle: (id: string) => void
  canDelete: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        borderRadius: '6px',
        background: '#f9fafb',
        border: '1px solid #f3f4f6',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: 'var(--text-main)',
            fontSize: '14px',
          }}
        >
          {person.repName}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {person.count > 1 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6b7280',
                background: '#e5e7eb',
                padding: '2px 6px',
                borderRadius: '10px',
              }}
            >
              x{person.count}
            </span>
          )}

          {canDelete && (
            <>
              {person.count > 1 ? (
                <button
                  onClick={() => onDeleteGroup(person.incidents.map(i => i.id))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '10px',
                  }}
                  title="Borrar todos"
                >
                  Borrar todo
                </button>
              ) : (
                <button
                  onClick={() => onDeleteSingle(person.incidents[0].id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                  }}
                  title="Borrar incidencia"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
})
