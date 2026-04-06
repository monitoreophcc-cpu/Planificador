'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { StatusPill } from '../components/StatusPill'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import type { IncidentType } from '@/domain/types'
import type { EnrichedIncident } from './logHelpers'
import type { GroupedByType, PersonInGroup } from './dailyEventsGrouping'

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
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Dia {incident.dayCount} de {incident.totalDuration}
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

export const PunctualIncidentGroup = memo(function PunctualIncidentGroup({
  group,
  onDeleteSingle,
  onDeleteGroup,
  canDelete,
}: {
  group: GroupedByType
  onDeleteSingle: (id: string) => void
  onDeleteGroup: (ids: string[]) => void
  canDelete: boolean
}) {
  const styleInfo = INCIDENT_STYLES[group.type] ?? INCIDENT_STYLES.OTRO

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
        <span
          style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-main)' }}
        >
          {group.totalCount}
        </span>
      </header>

      <div
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {group.type === 'OTRO'
          ? group.items?.map(incident => (
              <OtherIncidentRow
                key={incident.id}
                incident={incident}
                onDelete={onDeleteSingle}
                canDelete={canDelete}
              />
            ))
          : group.people?.map(person => (
              <PersonRow
                key={person.repName}
                person={person}
                onDeleteGroup={onDeleteGroup}
                onDeleteSingle={onDeleteSingle}
                canDelete={canDelete}
              />
            ))}
      </div>
    </motion.div>
  )
})
