import type { IncidentType } from '@/domain/types'
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

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
        }}
      >
        <div>
          <label style={labelStyle}>Tipo de incidencia</label>
          <select
            style={inputStyle}
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
            <label style={labelStyle}>
              Duracion (
              {incidentType === 'LICENCIA'
                ? 'dias naturales'
                : 'dias laborables'}
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
