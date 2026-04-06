'use client'

import type { ReactNode } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  ISODate,
  Representative,
} from '@/domain/types'
import { checkIncidentConflicts } from '@/domain/incidents/checkIncidentConflicts'

type ShowConfirm = (options: {
  title: string
  description?: ReactNode
  intent?: 'danger' | 'warning' | 'info'
  confirmLabel?: string
  cancelLabel?: string
}) => Promise<boolean>

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
  } = args

  const conflicts = checkIncidentConflicts(
    input.representativeId,
    input.startDate,
    input.type,
    input.duration,
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

  const result = await addIncident(input)

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

  alert(`Error: ${result.reason}`)
}
