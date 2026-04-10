import type { IncidentType } from '@/domain/types'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import {
  getDailyLogIncidentInputStyle,
  getDailyLogIncidentLabelStyle,
  getDailyLogIncidentTextareaStyle,
} from './dailyLogIncidentFormStyles'

type DailyLogIncidentFieldsProps = {
  customPoints: number | ''
  disabled: boolean
  duration: number
  incidentType: IncidentType
  note: string
  onCustomPointsChange: (value: number | '') => void
  onDurationChange: (value: number) => void
  onIncidentTypeChange: (value: IncidentType) => void
  onNoteChange: (value: string) => void
}

export function DailyLogIncidentFields({
  customPoints,
  disabled,
  duration,
  incidentType,
  note,
  onCustomPointsChange,
  onDurationChange,
  onIncidentTypeChange,
  onNoteChange,
}: DailyLogIncidentFieldsProps) {
  const labelStyle = getDailyLogIncidentLabelStyle()
  const inputStyle = getDailyLogIncidentInputStyle()
  const textareaStyle = getDailyLogIncidentTextareaStyle()
  const quickIncidentTypes: IncidentType[] = [
    'TARDANZA',
    'AUSENCIA',
    'ERROR',
    'LICENCIA',
    'VACACIONES',
    'OTRO',
  ]

  return (
    <>
      <div>
        <label style={labelStyle}>Tipo de incidencia</label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {quickIncidentTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onIncidentTypeChange(type)}
              disabled={disabled}
              style={getIncidentQuickActionStyle(incidentType === type, disabled, type)}
            >
              {INCIDENT_STYLES[type].label}
            </button>
          ))}
        </div>
      </div>

      {(incidentType === 'LICENCIA' || incidentType === 'VACACIONES' || incidentType === 'OTRO') ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {(incidentType === 'LICENCIA' || incidentType === 'VACACIONES') && (
            <div>
              <label style={labelStyle}>
                Duración (
                {incidentType === 'LICENCIA'
                  ? 'días naturales'
                  : 'días laborables'}
                )
              </label>
              <input
                type="number"
                style={inputStyle}
                min="1"
                value={duration}
                onChange={event =>
                  onDurationChange(Math.max(1, parseInt(event.target.value, 10) || 1))
                }
                disabled={disabled}
              />
            </div>
          )}

          {incidentType === 'OTRO' && (
            <div>
              <label style={labelStyle}>Puntos (manual)</label>
              <input
                type="number"
                style={inputStyle}
                min="0"
                value={customPoints}
                onChange={event =>
                  onCustomPointsChange(
                    Math.max(0, parseInt(event.target.value, 10) || 0)
                  )
                }
                disabled={disabled}
              />
            </div>
          )}
        </div>
      ) : null}

      <div>
        <label style={labelStyle}>Comentario (opcional)</label>
        <textarea
          style={textareaStyle}
          rows={3}
          placeholder="Escribe un comentario..."
          value={note}
          onChange={event => onNoteChange(event.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  )
}

function getIncidentQuickActionStyle(
  isActive: boolean,
  disabled: boolean,
  _type: IncidentType
): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-strong)'}`,
    background: isActive ? 'var(--color-primary)' : 'transparent',
    color: isActive ? 'var(--text-on-accent)' : '#334155',
    fontSize: '12px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  }
}
