import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import type { IncidentType } from '@/domain/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { InlineAlert } from '../components/InlineAlert'
import { getDailyLogIncidentSubmitStyle } from './dailyLogIncidentFormStyles'
import { AlertTriangle } from 'lucide-react'

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
          borderRadius: '12px',
          border: '1px solid var(--border-warning)',
          background: 'var(--bg-warning)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <AlertTriangle size={16} color="var(--text-warning)" />
        <strong style={{ fontSize: '16px', color: 'var(--text-warning)' }}>
          Impacto: {preview.points} punto(s)
        </strong>
      </div>

      <div>
        <button
          type="submit"
          disabled={disabled}
          title={disabled ? 'Selecciona un representante y tipo de incidencia' : undefined}
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
      points: 0,
    }
  }

  if (incidentType === 'AUSENCIA') {
    return {
      title: `Registrar ausencia para ${targetName}`,
      description: `Se registrará sobre ${formattedDate}. Antes de guardar se confirmará si la ausencia fue justificada; si no lo es, el impacto estimado es de hasta ${pointsPreview} puntos.`,
      buttonLabel: 'Revisar ausencia',
      points: pointsPreview,
    }
  }

  if (incidentType === 'OTRO') {
    return {
      title: `Registrar evento manual para ${targetName}`,
      description:
        customPoints === ''
          ? `Se guardará en ${formattedDate}. Define los puntos manuales si este evento debe afectar el acumulado.`
          : `Se guardará en ${formattedDate} con ${pointsPreview} puntos manuales.`,
      buttonLabel: 'Registrar evento manual',
      points: pointsPreview,
    }
  }

  return {
    title: `Registrar ${labelMap[incidentType]} para ${targetName}`,
    description: `Se guardará en ${formattedDate} con un impacto estimado de ${pointsPreview} puntos.`,
    buttonLabel: `Registrar ${labelMap[incidentType]}`,
    points: pointsPreview,
  }
}
