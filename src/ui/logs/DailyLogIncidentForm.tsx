'use client'

import type { FormEventHandler } from 'react'
import type { IncidentType } from '@/domain/types'
import { InlineAlert } from '../components/InlineAlert'

const formStyles = {
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
}

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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
          }}
        >
          <div>
            <label style={formStyles.label}>Tipo de incidencia</label>
            <select
              style={formStyles.input}
              value={incidentType}
              onChange={event =>
                onIncidentTypeChange(event.target.value as IncidentType)
              }
            >
              <option value="TARDANZA">Tardanza</option>
              <option value="AUSENCIA">Ausencia</option>
              <option value="ERROR">Error</option>
              <option value="OTRO">Otro</option>
              <option value="LICENCIA">Licencia</option>
              <option value="VACACIONES">Vacaciones</option>
            </select>
          </div>

          {(incidentType === 'LICENCIA' || incidentType === 'VACACIONES') && (
            <div>
              <label style={formStyles.label}>
                Duracion (
                {incidentType === 'LICENCIA'
                  ? 'dias naturales'
                  : 'dias laborables'}
                )
              </label>
              <input
                type="number"
                style={formStyles.input}
                min="1"
                value={duration}
                onChange={event =>
                  onDurationChange(
                    Math.max(1, parseInt(event.target.value, 10) || 1)
                  )
                }
                disabled={!hasSelectedRep}
              />
            </div>
          )}

          {incidentType === 'OTRO' && (
            <div>
              <label style={formStyles.label}>Puntos (manual)</label>
              <input
                type="number"
                style={formStyles.input}
                min="0"
                value={customPoints}
                onChange={event =>
                  onCustomPointsChange(
                    Math.max(0, parseInt(event.target.value, 10) || 0)
                  )
                }
                disabled={!hasSelectedRep}
              />
            </div>
          )}
        </div>

        <div>
          <label style={formStyles.label}>Comentario (opcional)</label>
          <textarea
            style={{ ...formStyles.input, height: '60px' }}
            placeholder="Escribe un comentario..."
            value={note}
            onChange={event => onNoteChange(event.target.value)}
            disabled={!hasSelectedRep}
          />
        </div>

        {conflictMessages.length > 0 && (
          <InlineAlert variant="warning">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {conflictMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </InlineAlert>
        )}

        <div>
          <button
            type="submit"
            disabled={!hasSelectedRep}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              backgroundColor: !hasSelectedRep
                ? 'var(--bg-subtle)'
                : 'var(--accent)',
              color: !hasSelectedRep ? 'var(--text-muted)' : '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: !hasSelectedRep ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'background-color 0.2s',
            }}
          >
            Registrar evento
          </button>
        </div>
      </div>
    </form>
  )
}
