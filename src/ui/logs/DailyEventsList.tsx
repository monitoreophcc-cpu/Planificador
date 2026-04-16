'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { INCIDENT_STYLES } from '../../domain/incidents/incidentStyles'
import { useAppStore } from '@/store/useAppStore'
import type { IncidentType } from '@/domain/types'
import { useEditMode } from '@/hooks/useEditMode'
import { EnrichedIncident } from './logHelpers'
import {
  groupDailyEvents,
  type PersonInGroup,
} from './dailyEventsGrouping'
import {
  PunctualIncidentGroup,
  RangeIncidentCard,
} from './DailyEventCards'

interface DailyEventsListProps {
  title: string
  incidents: EnrichedIncident[]
  emptyMessage: string
}

export function DailyEventsList({
  title,
  incidents = [],
  emptyMessage,
}: DailyEventsListProps) {
  const { removeIncident, removeIncidents, showConfirm } = useAppStore(s => ({
    removeIncident: s.removeIncident,
    removeIncidents: s.removeIncidents,
    showConfirm: s.showConfirm
  }))

  const { mode } = useEditMode()
  const canDelete = mode === 'ADMIN_OVERRIDE'

  // Local state for editing note removed per rule: Comments only in detail modal

  const { punctualGroups, rangeIncidents } = useMemo(
    () => groupDailyEvents(incidents),
    [incidents]
  )

  const handleDeleteGroup = async (person: PersonInGroup, type: IncidentType) => {
    const styleInfo = INCIDENT_STYLES[type] ?? INCIDENT_STYLES['OTRO']
    const confirmed = await showConfirm({
      title: `¿Eliminar ${person.count} incidencias?`,
      description: `Esto eliminará permanentemente todas las incidencias de tipo "${styleInfo.label}" registradas para ${person.repName} en este día.`,
      intent: 'danger',
      confirmLabel: 'Sí, eliminar',
    })
    if (confirmed) {
      removeIncidents(person.incidents.map(i => i.id))
    }
  }

  const handleDeleteSingle = async (incident: EnrichedIncident) => {
    const confirmed = await showConfirm({
      title: `¿Eliminar incidencia?`,
      description: `Esto eliminará permanentemente la incidencia "${incident.note || INCIDENT_STYLES[incident.type].label
        }" registrada para ${incident.repName}`,
      intent: 'danger',
      confirmLabel: 'Sí, eliminar',
    })
    if (confirmed) {
      removeIncident(incident.id)
    }
  }

  // Editing handlers removed

  const hasItems = incidents.length > 0

  return (
    <section>
      <h3
        style={{
          marginBottom: '0.75rem',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        {incidents.length > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {incidents.length} eventos
          </span>
        )}
      </h3>
      {title.includes('Monitor') ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
            Licencia
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            Vacaciones
          </span>
        </div>
      ) : null}

      <AnimatePresence mode="popLayout">
        {!hasItems && (
          <motion.div
            key="empty-day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px 0',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px dashed #e5e7eb',
            }}
          >
            {emptyMessage}
          </motion.div>
        )}

        {rangeIncidents.map(incident => (
          <RangeIncidentCard
            key={incident.id}
            incident={incident}
            onDelete={() => handleDeleteSingle(incident)}
            canDelete={canDelete}
          />
        ))}

        {punctualGroups.map(group => (
          <PunctualIncidentGroup
            key={group.type}
            group={group}
            onDeleteSingle={(id) => {
              // 🛡️ FIX: Look in 'items' (OTRO) AND 'people' (Standard)
              // Or simply search the main incidents list which is safer and O(N) is negligible here.
              const incident = incidents.find(i => i.id === id)
              if (incident) handleDeleteSingle(incident)
            }}
            onDeleteGroup={(ids) => {
              const person = group.people?.find(p => p.incidents.some(i => i.id === ids[0]));
              if (person) handleDeleteGroup(person, group.type)
            }}
            canDelete={canDelete}
          />
        ))}

      </AnimatePresence>

      {/* ConfirmDialog for editing removed */}
    </section>
  )
}
