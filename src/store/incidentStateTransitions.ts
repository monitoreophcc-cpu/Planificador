import type {
  DayInfo,
  Incident,
  Representative,
} from '@/domain/types'
import type { VacationConfirmationPayload } from './useAppUiStore'
import type { AppState } from './useAppStore'
import type { IncidentRuntime } from './incidentRuntime'

interface ApplyIncidentToStateArgs {
  state: Pick<AppState, 'incidents'>
  incident: Incident
  disciplinaryKey?: string
  representative: Representative
  allCalendarDaysForRelevantMonths: DayInfo[]
  resolveIncidentDates: IncidentRuntime['resolveIncidentDates']
  addHistoryEvent: AppState['addHistoryEvent']
}

export function applyIncidentToState({
  state,
  incident,
  disciplinaryKey,
  representative,
  allCalendarDaysForRelevantMonths,
  resolveIncidentDates,
  addHistoryEvent,
}: ApplyIncidentToStateArgs): VacationConfirmationPayload | null {
  const incidentWithKey = {
    ...incident,
    disciplinaryKey,
  }

  if (incidentWithKey.type === 'AUSENCIA') {
    const removedIncidents = state.incidents.filter(
      currentIncident =>
        currentIncident.representativeId === incidentWithKey.representativeId &&
        currentIncident.startDate === incidentWithKey.startDate &&
        currentIncident.disciplinaryKey === disciplinaryKey
    )

    if (removedIncidents.length > 0) {
      addHistoryEvent({
        category: 'SYSTEM',
        title: 'Incidencia actualizada',
        subject: representative.name,
        description: `Se reemplazó un evento previo (${disciplinaryKey}).`,
      })
    }

    state.incidents = state.incidents.filter(
      currentIncident =>
        !(
          currentIncident.representativeId === incidentWithKey.representativeId &&
          currentIncident.startDate === incidentWithKey.startDate &&
          currentIncident.disciplinaryKey === disciplinaryKey
        )
    )
  }

  if (!state.incidents.some(existingIncident => existingIncident.id === incidentWithKey.id)) {
    state.incidents.push(incidentWithKey)
  }

  if (incident.type !== 'VACACIONES') return null

  const resolvedDates = resolveIncidentDates(
    incident,
    allCalendarDaysForRelevantMonths,
    representative
  )

  if (resolvedDates.dates.length === 0) return null

  return {
    repName: representative.name,
    startDate: resolvedDates.start || incident.startDate,
    endDate: resolvedDates.end || incident.startDate,
    returnDate: resolvedDates.returnDate || incident.startDate,
    workingDays: resolvedDates.dates.length,
  }
}
