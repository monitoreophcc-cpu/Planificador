'use client'

import type { FormEventHandler } from 'react'
import type { IncidentType } from '@/domain/types'
import { DailyLogIncidentFields } from './DailyLogIncidentFields'
import { DailyLogIncidentSubmit } from './DailyLogIncidentSubmit'

interface DailyLogIncidentFormProps {
  conflictMessages: string[]
  customPoints: number | ''
  duration: number
  incidentType: IncidentType
  note: string
  onCustomPointsChange: (value: number | '') => void
  onDurationChange: (value: number) => void
  onIncidentTypeChange: (value: IncidentType) => void
  onNoteChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  selectedRepName?: string
}

export function DailyLogIncidentForm({
  conflictMessages,
  customPoints,
  duration,
  incidentType,
  note,
  onCustomPointsChange,
  onDurationChange,
  onIncidentTypeChange,
  onNoteChange,
  onSubmit,
  selectedRepName,
}: DailyLogIncidentFormProps) {
  const hasSelectedRep = Boolean(selectedRepName)

  return (
    <form onSubmit={onSubmit}>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <header>
          <h3
            style={{
              margin: 0,
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-main)',
            }}
          >
            {selectedRepName ? (
              <>
                Registrar para:{' '}
                <span style={{ fontWeight: 700 }}>{selectedRepName}</span>
              </>
            ) : (
              'Seleccione un representante para comenzar'
            )}
          </h3>
        </header>

        <DailyLogIncidentFields
          customPoints={customPoints}
          disabled={!hasSelectedRep}
          duration={duration}
          incidentType={incidentType}
          note={note}
          onCustomPointsChange={onCustomPointsChange}
          onDurationChange={onDurationChange}
          onIncidentTypeChange={onIncidentTypeChange}
          onNoteChange={onNoteChange}
        />

        <DailyLogIncidentSubmit
          conflictMessages={conflictMessages}
          disabled={!hasSelectedRep}
        />
      </div>
    </form>
  )
}
