'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { StatusPill } from '../components/StatusPill'
import type { GroupedByType } from './dailyEventsGrouping'
import { OtherIncidentRow } from './DailyEventOtherIncidentRow'
import { PersonRow } from './DailyEventPersonRow'

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
