'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import { StatusPill } from '../components/StatusPill'
import type { EnrichedIncident } from './logHelpers'

export const RangeIncidentCard = memo(function RangeIncidentCard({
  incident,
  onDelete,
  canDelete,
}: {
  incident: EnrichedIncident
  onDelete: (id: string) => void
  canDelete: boolean
}) {
  const styleInfo = INCIDENT_STYLES[incident.type] ?? INCIDENT_STYLES.OTRO

  if (
    typeof incident.progressRatio !== 'number' ||
    typeof incident.dayCount !== 'number' ||
    typeof incident.totalDuration !== 'number'
  ) {
    return null
  }

  const progress = incident.progressRatio * 100

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        marginBottom: '1rem',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        background: 'var(--bg-panel)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <StatusPill label={styleInfo.label} variant={styleInfo.variant} />
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </header>

      <div
        style={{
          padding: '12px 15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          {incident.repName}
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            background: '#f3f4f6',
            height: '8px',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              background: styleInfo.variant === 'ok' ? '#22c55e' : '#3b82f6',
              borderRadius: '4px',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Día {incident.dayCount} de {incident.totalDuration}
          </span>
          {incident.returnDate && (
            <span style={{ fontWeight: 500 }}>
              Reingresa:{' '}
              {format(parseLocalDate(incident.returnDate), 'dd/MM/yyyy', {
                locale: es,
              })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
})
