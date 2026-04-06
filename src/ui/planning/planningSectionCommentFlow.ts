'use client'

import { useAppStore } from '@/store/useAppStore'
import type {
  Incident,
  IncidentInput,
  ISODate,
  WeeklyPlan,
} from '@/domain/types'
import { getPlannerDayAssignment } from './planningSectionOverrideHelpers'

interface HandlePlanningCommentParams {
  addIncident: (
    input: IncidentInput,
    allowOverride?: boolean
  ) => Promise<{ ok: boolean; newId?: string; reason?: string }>
  buildPlanningCommentInput: (args: {
    currentAssignment: ReturnType<typeof getPlannerDayAssignment>
    date: ISODate
    note: string | undefined
    representativeId: string
  }) => IncidentInput
  date: ISODate
  incidents: Incident[]
  representativeId: string
  showConfirmWithInput: (options: {
    title: string
    description: string
    placeholder: string
    optional?: boolean
  }) => Promise<string | undefined>
  weeklyPlan: WeeklyPlan | null
}

export async function handlePlanningComment({
  addIncident,
  buildPlanningCommentInput,
  date,
  incidents,
  representativeId,
  showConfirmWithInput,
  weeklyPlan,
}: HandlePlanningCommentParams) {
  const existingIncident = incidents.find(
    incident =>
      incident.representativeId === representativeId &&
      incident.startDate === date &&
      incident.type === 'OVERRIDE'
  )

  const result = await showConfirmWithInput({
    title: 'Comentario de Planificacion',
    description: 'Agrega o edita una nota para este dia:',
    placeholder: 'Ej: Permiso especial, cita medica, etc.',
    optional: true,
  })

  if (result === undefined) {
    return
  }

  const newNote = result.trim() || undefined

  if (existingIncident) {
    useAppStore.getState().updateIncident(existingIncident.id, { note: newNote })
    return
  }

  if (!weeklyPlan || !newNote) {
    return
  }

  const currentAssignment = getPlannerDayAssignment({
    date,
    representativeId,
    weeklyPlan,
  })

  const incidentInput = buildPlanningCommentInput({
    currentAssignment,
    date,
    note: newNote,
    representativeId,
  })

  await addIncident(incidentInput, true)
}
