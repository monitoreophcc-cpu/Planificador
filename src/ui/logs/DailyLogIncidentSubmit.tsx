import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { IncidentType } from '@/domain/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { InlineAlert } from '../components/InlineAlert'
import { getDailyLogIncidentSubmitStyle } from './dailyLogIncidentFormStyles'

type DailyLogIncidentSubmitProps = {
  conflictMessages: string[]
  customPoints: number | ''
  disabled: boolean
  duration: number
  incidentType: IncidentType
  logDate: string
  selectedRepName?: string
}

export function DailyLogIncidentSubmit({
  conflictMessages,
  customPoints,
  disabled,
  duration,
  incidentType,
  logDate,
  selectedRepName,
}: DailyLogIncidentSubmitProps) {
  const preview = buildIncidentPreview({
    customPoints,
    duration,
    incidentType,
    logDate,
    selectedRepName,
  })

  return (
    <>
      {conflictMessages.length > 0 && (
        <InlineAlert variant="warning">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {conflictMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </InlineAlert>
      )}

      <div
        style={{
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          background: 'rgba(248,250,252,0.86)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
          }}
        >
          Vista previa
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-main)',
          }}
        >
          {preview.title}
        </div>
        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}
        >
          {preview.description}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={disabled}
          style={getDailyLogIncidentSubmitStyle(disabled)}
        >
          {preview.buttonLabel}
        </button>
      </div>
    </>
  )
}

function buildIncidentPreview({
  customPoints,
  duration,
  incidentType,
  logDate,
  selectedRepName,
}: {
  customPoints: number | ''
  duration: number
  incidentType: IncidentType
  logDate: string
  selectedRepName?: string
}) {
  const formattedDate = format(parseISO(logDate), "d 'de' MMMM", {
    locale: es,
  })
  const targetName = selectedRepName ?? 'la ficha seleccionada'
  const labelMap: Record<IncidentType, string> = {
    TARDANZA: 'tardanza',
    AUSENCIA: 'ausencia',
    ERROR: 'error operativo',
    OTRO: 'evento manual',
    LICENCIA: 'licencia',
    VACACIONES: 'vacaciones',
    OVERRIDE: 'ajuste interno',
    SWAP: 'intercambio',
  }

  const pointsPreview = calculatePoints({
    id: 'preview',
    representativeId: 'preview',
    type: incidentType,
    startDate: logDate,
    duration,
    createdAt: logDate,
    customPoints: customPoints === '' ? 0 : Number(customPoints),
  })

  if (incidentType === 'LICENCIA' || incidentType === 'VACACIONES') {
    return {
      title: `Registrar ${labelMap[incidentType]} para ${targetName}`,
      description: `Se aplicará desde ${formattedDate} por ${duration} día(s). Este registro es administrativo y no suma puntos punitivos.`,
      buttonLabel: `Registrar ${labelMap[incidentType]}`,
    }
  }

  if (incidentType === 'AUSENCIA') {
    return {
      title: `Registrar ausencia para ${targetName}`,
      description: `Se registrará sobre ${formattedDate}. Antes de guardar se confirmará si la ausencia fue justificada; si no lo es, el impacto estimado es de hasta ${pointsPreview} punto(s).`,
      buttonLabel: 'Revisar ausencia',
    }
  }

  if (incidentType === 'OTRO') {
    return {
      title: `Registrar evento manual para ${targetName}`,
      description:
        customPoints === ''
          ? `Se guardará en ${formattedDate}. Define los puntos manuales si este evento debe afectar el acumulado.`
          : `Se guardará en ${formattedDate} con ${pointsPreview} punto(s) manual(es).`,
      buttonLabel: 'Registrar evento manual',
    }
  }

  return {
    title: `Registrar ${labelMap[incidentType]} para ${targetName}`,
    description: `Se guardará en ${formattedDate} con un impacto estimado de ${pointsPreview} punto(s).`,
    buttonLabel: `Registrar ${labelMap[incidentType]}`,
  }
}
