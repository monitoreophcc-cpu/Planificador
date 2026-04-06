'use client'

import { DailyEventsList } from './DailyEventsList'
import type { EnrichedIncident } from './logHelpers'

interface DailyLogEventPanelsProps {
  dayIncidents: EnrichedIncident[]
  ongoingIncidents: EnrichedIncident[]
}

export function DailyLogEventPanels({
  dayIncidents,
  ongoingIncidents,
}: DailyLogEventPanelsProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-md)',
        overflowY: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-lg)',
          overflowY: 'auto',
          marginBottom: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <DailyEventsList
          title="Incidencias del Dia"
          incidents={dayIncidents}
          emptyMessage="No hay incidencias puntuales registradas hoy."
        />
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-xl)',
          overflowY: 'auto',
          marginBottom: 'var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <DailyEventsList
          title="Eventos en Curso (Monitor)"
          incidents={ongoingIncidents}
          emptyMessage="No hay licencias o vacaciones activas."
        />
      </div>
    </div>
  )
}
