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
  type: IncidentType
): React.CSSProperties {
  const tones: Record<
    IncidentType,
    { accent: string; background: string; border: string }
  > = {
    TARDANZA: {
      accent: '#b45309',
      background: 'rgba(255, 251, 235, 0.96)',
      border: 'rgba(245, 158, 11, 0.22)',
    },
    AUSENCIA: {
      accent: '#b91c1c',
      background: 'rgba(254, 242, 242, 0.96)',
      border: 'rgba(248, 113, 113, 0.22)',
    },
    ERROR: {
      accent: '#be123c',
      background: 'rgba(255, 241, 242, 0.96)',
      border: 'rgba(244, 114, 182, 0.2)',
    },
    LICENCIA: {
      accent: '#1d4ed8',
      background: 'rgba(239, 246, 255, 0.96)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
    VACACIONES: {
      accent: '#0f766e',
      background: 'rgba(240, 253, 250, 0.96)',
      border: 'rgba(13, 148, 136, 0.18)',
    },
    OTRO: {
      accent: '#475569',
      background: 'rgba(248, 250, 252, 0.96)',
      border: 'rgba(148, 163, 184, 0.18)',
    },
    OVERRIDE: {
      accent: '#475569',
      background: 'rgba(248, 250, 252, 0.96)',
      border: 'rgba(148, 163, 184, 0.18)',
    },
    SWAP: {
      accent: '#1d4ed8',
      background: 'rgba(239, 246, 255, 0.96)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
  }

  return {
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${isActive ? tones[type].border : 'rgba(148, 163, 184, 0.16)'}`,
    background: isActive ? tones[type].background : 'rgba(255,255,255,0.9)',
    color: isActive ? tones[type].accent : '#475569',
    fontSize: '12px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  }
}
