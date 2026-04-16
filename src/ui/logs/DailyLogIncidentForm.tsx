'use client'

import type { FormEventHandler } from 'react'
import type { IncidentType } from '@/domain/types'
import { UserRoundSearch } from 'lucide-react'
import { DailyLogIncidentFields } from './DailyLogIncidentFields'
import { DailyLogIncidentSubmit } from './DailyLogIncidentSubmit'

interface DailyLogIncidentFormProps {
  conflictMessages: string[]
  customPoints: number | ''
  duration: number
  incidentType: IncidentType
  logDate: string
  note: string
  readOnly?: boolean
  onCustomPointsChange: (value: number | '') => void
  onDurationChange: (value: number) => void
  onIncidentTypeChange: (value: IncidentType) => void
  onNoteChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  selectedRepMeta?: string
  selectedRepName?: string
  selectedRepStatusPills?: Array<{
    label: string
    tone: {
      accent: string
      background: string
      border: string
    }
  }>
}

export function DailyLogIncidentForm({
  conflictMessages,
  customPoints,
  duration,
  incidentType,
  logDate,
  note,
  readOnly = false,
  onCustomPointsChange,
  onDurationChange,
  onIncidentTypeChange,
  onNoteChange,
  onSubmit,
  selectedRepMeta,
  selectedRepName,
  selectedRepStatusPills = [],
}: DailyLogIncidentFormProps) {
  const hasSelectedRep = Boolean(selectedRepName)
  const isDisabled = !hasSelectedRep || readOnly

  return (
    <form onSubmit={onSubmit}>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <header>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: hasSelectedRep ? '#2563eb' : '#64748b',
              marginBottom: '8px',
            }}
          >
            Registro guiado
          </div>
          <h3
            style={{
              margin: 0,
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: '1.05rem',
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
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            {selectedRepMeta ??
              'Selecciona una ficha desde la lista lateral y luego registra la incidencia con el contexto del día ya visible arriba.'}
          </p>

          {selectedRepStatusPills.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              {selectedRepStatusPills.map(pill => (
                <span
                  key={pill.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    border: `1px solid ${pill.tone.border}`,
                    background: pill.tone.background,
                    color: pill.tone.accent,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {hasSelectedRep ? (
          <>
            <DailyLogIncidentFields
              customPoints={customPoints}
              disabled={isDisabled}
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
              customPoints={customPoints}
              disabled={isDisabled}
              duration={duration}
              incidentType={incidentType}
              logDate={logDate}
              selectedRepName={selectedRepName}
            />
          </>
        ) : (
          <div
            style={{
              border: '1px dashed var(--border-subtle)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
              background: 'var(--bg-subtle)',
            }}
          >
            <UserRoundSearch size={24} color="var(--color-primary)" />
            <strong style={{ fontSize: '16px' }}>Selecciona un representante</strong>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Elige una ficha de la lista para registrar una incidencia
            </span>
          </div>
        )}
      </div>
    </form>
  )
}
