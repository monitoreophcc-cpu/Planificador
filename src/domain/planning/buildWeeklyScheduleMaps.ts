import type {
  DayInfo,
  Incident,
  SpecialSchedule,
} from '../types'
import { resolveIncidentDates } from '../incidents/resolveIncidentDates'

export function buildDailyIncidentMap(
  incidents: Incident[],
  allCalendarDays: DayInfo[]
) {
  const dailyIncidentMap = new Map<string, Incident[]>()

  incidents
    .filter(incident => incident.type === 'VACACIONES' || incident.type === 'LICENCIA')
    .forEach(incident => {
      const resolved = resolveIncidentDates(incident, allCalendarDays)
      resolved.dates.forEach(date => {
        const key = `${incident.representativeId}:${date}`
        if (!dailyIncidentMap.has(key)) dailyIncidentMap.set(key, [])
        dailyIncidentMap.get(key)!.push(incident)
      })
    })

  incidents
    .filter(
      incident =>
        incident.type === 'OVERRIDE' ||
        incident.type === 'AUSENCIA' ||
        incident.type === 'SWAP'
    )
    .forEach(incident => {
      const resolved = resolveIncidentDates(incident, allCalendarDays)
      resolved.dates.forEach(date => {
        const key = `${incident.representativeId}:${date}`
        if (!dailyIncidentMap.has(key)) dailyIncidentMap.set(key, [])
        dailyIncidentMap.get(key)!.push(incident)
      })
    })

  return dailyIncidentMap
}

export function buildSpecialSchedulesMap(specialSchedules: SpecialSchedule[]) {
  const globalSchedules = specialSchedules.filter(
    specialSchedule => specialSchedule.scope === 'GLOBAL'
  )

  const individualSchedulesMap = new Map<string, SpecialSchedule[]>()

  specialSchedules.forEach(specialSchedule => {
    if (specialSchedule.scope === 'INDIVIDUAL' && specialSchedule.targetId) {
      if (!individualSchedulesMap.has(specialSchedule.targetId)) {
        individualSchedulesMap.set(specialSchedule.targetId, [])
      }

      individualSchedulesMap.get(specialSchedule.targetId)!.push(specialSchedule)
    }
  })

  return {
    globalSchedules,
    individualSchedulesMap,
  }
}
