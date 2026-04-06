'use client'

import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { EnrichedIncident } from './logHelpers'

export const OtherIncidentRow = memo(function OtherIncidentRow({
  incident,
  onDelete,
  canDelete,
}: {
  incident: EnrichedIncident
  onDelete: (id: string) => void
  canDelete: boolean
}) {
  const points = calculatePoints(incident)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px',
        borderRadius: '6px',
        background: '#f9fafb',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
          {incident.repName}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {points > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>
              -{points} pts
            </div>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(incident.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
