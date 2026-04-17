'use client'

import type { ReactNode } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  ISODate,
  Representative,
} from '@/domain/types'
import type { DailyLogBulkMode } from './dailyLogTypes'
import { checkIncidentConflicts } from '@/domain/incidents/checkIncidentConflicts'
import { evaluateAnnualVacationLimit } from '@/domain/incidents/evaluateAnnualVacationLimit'
import type { ToastType } from '@/ui/components/ToastProvider'

type ShowConfirm = (options: {
  title: string
  description?: ReactNode
  intent?: 'danger' | 'warning' | 'info'
  confirmLabel?: string
  cancelLabel?: string
}) => Promise<boolean>

type ShowToast = (options: {
  title: string
  message: string
  type?: ToastType
}) => void

function appendVacationExceptionNote(note?: string): string {
  const trimmedNote = note?.trim()
  const exceptionNote = '[Excepción: límite anual de vacaciones excedido]'

  return trimmedNote ? `${trimmedNote} ${exceptionNote}` : exceptionNote
}

export function buildAbsenceIncidentInput(args: {
  logDate: ISODate
  note: string
  resolution: {
    source: 'BASE' | 'COVERAGE' | 'SWAP' | 'OVERRIDE'
    slotOwnerId: string
    targetRepId: string
  }
  isJustified: boolean
}): IncidentInput {
  const { isJustified, logDate, note, resolution } = args

  return {
    representativeId: resolution.targetRepId,
    type: 'AUSENCIA',
    startDate: logDate,
    duration: 1,
    note: note.trim() || undefined,
    source: resolution.source,
    slotOwnerId:
      resolution.slotOwnerId !== resolution.targetRepId
        ? resolution.slotOwnerId
        : undefined,
    details: isJustified ? 'JUSTIFICADA' : 'INJUSTIFICADA',
  }
}

export async function submitDailyLogIncident(args: {
  addIncident: (
    data: IncidentInput
  ) => Promise<{ ok: true; newId: string } | { ok: false; reason: string }>
  allCalendarDaysForRelevantMonths: DayInfo[]
  incidents: Incident[]
  input: IncidentInput
  pushUndo: (
    action: { label: string; undo: () => void },
    timeoutMs?: number
  ) => void
  removeIncident: (id: string, silent?: boolean) => void
  representative: Representative
  setCustomPoints: (value: number | '') => void
  setNote: (value: string) => void
  showConfirm: ShowConfirm
  showToast: ShowToast
}) {
  const {
    addIncident,
    allCalendarDaysForRelevantMonths,
    incidents,
    input,
    pushUndo,
    removeIncident,
    representative,
    setCustomPoints,
    setNote,
    showConfirm,
    showToast,
  } = args
  let preparedInput = input

  if (input.type === 'VACACIONES') {
    const vacationLimit = evaluateAnnualVacationLimit({
      incidents,
      representativeId: representative.id,
      startDate: input.startDate,
      requestedDays: input.duration,
    })

    if (vacationLimit.status === 'excess') {
      const proceed = await showConfirm({
        title: 'Límite anual de vacaciones excedido',
        description: ` ${representative.name} ya tiene ${vacationLimit.usedDays} días en ${vacationLimit.year}. Esta solicitud sumará ${vacationLimit.projectedDays} de ${vacationLimit.limit}. ¿Registrar como excepción?`.trim(),
        intent: 'warning',
        confirmLabel: 'Registrar excepción',
        cancelLabel: 'Cancelar',
      })

      if (!proceed) {
        return
      }

      preparedInput = {
        ...input,
        note: appendVacationExceptionNote(input.note),
      }
    }
  }

  const conflicts = checkIncidentConflicts(
    preparedInput.representativeId,
    preparedInput.startDate,
    preparedInput.type,
    preparedInput.duration,
    incidents,
    allCalendarDaysForRelevantMonths,
    representative
  )

  if (conflicts.hasConflict) {
    const proceed = await showConfirm({
      title: 'Conflictos Detectados',
      description: (
        <ul style={{ textAlign: 'left', margin: 0, paddingLeft: '20px' }}>
          {(conflicts.messages ?? [
            conflicts.message ?? 'Conflicto detectado',
          ]).map((message: string, index: number) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      ),
      intent: 'warning',
      confirmLabel: 'Confirmar e Ignorar',
    })

    if (!proceed) {
      return
    }
  }

  const result = await addIncident(preparedInput)

  if (result.ok) {
    setNote('')
    setCustomPoints('')

    if (result.newId) {
      pushUndo({
        label: `Incidencia registrada para ${representative.name}`,
        undo: () => removeIncident(result.newId),
      })
    }

    return
  }

  showToast({
    title: 'No se pudo registrar la incidencia',
    message: result.reason,
    type: 'error',
  })
}

export async function submitDailyLogIncidentBatch(args: {
  addIncident: (
    data: IncidentInput,
    skipConfirm?: boolean
  ) => Promise<{ ok: true; newId: string } | { ok: false; reason: string }>
  bulkMode: DailyLogBulkMode
  bulkNote: string
  bulkSelectedRepIds: string[]
  bulkAbsenceJustified: boolean
  bulkCustomPoints: number
  logDate: ISODate
  pushUndo: (
    action: { label: string; undo: () => void },
    timeoutMs?: number
  ) => void
  removeIncidents: (ids: string[]) => void
  representatives: Representative[]
  showConfirm: ShowConfirm
}) {
  const {
    addIncident,
    bulkAbsenceJustified,
    bulkCustomPoints,
    bulkMode,
    bulkNote,
    bulkSelectedRepIds,
    logDate,
    pushUndo,
    removeIncidents,
    representatives,
    showConfirm,
  } = args

  const selectedRepresentatives = bulkSelectedRepIds
    .map(representativeId =>
      representatives.find(representative => representative.id === representativeId)
    )
    .filter((representative): representative is Representative => Boolean(representative))

  if (selectedRepresentatives.length === 0) {
    return {
      ok: false as const,
      reason: 'Selecciona al menos un representante para el lote.',
      failures: [],
      createdIds: [],
    }
  }

  const countLabel =
    selectedRepresentatives.length === 1
      ? '1 persona'
      : `${selectedRepresentatives.length} personas`

  const title =
    bulkMode === 'AUSENCIA'
      ? `Vas a registrar ausencia ${
          bulkAbsenceJustified ? 'justificada' : 'injustificada'
        } a ${countLabel}. ¿Confirmar?`
      : `Vas a registrar evento manual a ${countLabel}. ¿Confirmar?`

  const description =
    bulkMode === 'AUSENCIA'
      ? bulkNote.trim()
        ? `Comentario global: "${bulkNote.trim()}".`
        : 'Se aplicará el mismo criterio a todas las fichas seleccionadas.'
      : bulkNote.trim()
        ? `Cada registro usará ${bulkCustomPoints} puntos y el comentario "${bulkNote.trim()}".`
        : `Cada registro usará ${bulkCustomPoints} puntos manuales.`

  const confirmed = await showConfirm({
    title: 'Registrar lote',
    description: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{description}</div>
      </div>
    ),
    intent:
      bulkMode === 'AUSENCIA' && !bulkAbsenceJustified ? 'danger' : 'info',
    confirmLabel: 'Registrar lote',
    cancelLabel: 'Cancelar',
  })

  if (!confirmed) {
    return {
      ok: false as const,
      reason: 'Acción cancelada por el usuario.',
      failures: [],
      createdIds: [],
    }
  }

  const createdIds: string[] = []
  const failures: Array<{ id: string; name: string; reason: string }> = []

  for (const representative of selectedRepresentatives) {
    const input: IncidentInput =
      bulkMode === 'AUSENCIA'
        ? {
            representativeId: representative.id,
            type: 'AUSENCIA',
            startDate: logDate,
            duration: 1,
            note: bulkNote.trim() || undefined,
            details: bulkAbsenceJustified ? 'JUSTIFICADA' : 'INJUSTIFICADA',
          }
        : {
            representativeId: representative.id,
            type: 'OTRO',
            startDate: logDate,
            duration: 1,
            note: bulkNote.trim() || undefined,
            customPoints: Number.isFinite(bulkCustomPoints)
              ? Math.max(0, bulkCustomPoints)
              : 0,
          }

    const result = await addIncident(input, true)

    if (result.ok) {
      createdIds.push(result.newId)
      continue
    }

    failures.push({
      id: representative.id,
      name: representative.name,
      reason: result.reason,
    })
  }

  if (createdIds.length > 0) {
    pushUndo(
      {
        label:
          createdIds.length === 1
            ? '1 registro masivo'
            : `${createdIds.length} registros masivos`,
        undo: () => removeIncidents(createdIds),
      },
      7000
    )
  }

  if (failures.length > 0) {
    return {
      ok: false as const,
      reason:
        createdIds.length > 0
          ? `Se registraron ${createdIds.length} de ${selectedRepresentatives.length}.`
          : 'No se pudo registrar el lote.',
      failures,
      createdIds,
    }
  }

  return {
    ok: true as const,
    failures: [],
    createdIds,
  }
}
