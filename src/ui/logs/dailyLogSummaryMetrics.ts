'use client'

import { incidentLabel } from '@/application/presenters/humanize'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import type {
  DayInfo,
  Incident,
  IncidentType,
  ISODate,
  Representative,
  ShiftType,
} from '@/domain/types'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'

type SummaryMetricTone = 'accent' | 'warning' | 'danger' | 'neutral'

type DailyStats = {
  dayPresent: number
  dayPlanned: number
  nightPresent: number
  nightPlanned: number
}

export type DailyLogSummaryMetric = {
  id: 'availability' | 'shift' | 'incidents' | 'coverage'
  title: string
  value: string
  caption: string
  tone: SummaryMetricTone
}

export function getDailyLogSummaryMetrics(args: {
  activeCoveragesCount: number
  activeShift: ShiftType
  allCalendarDaysForRelevantMonths: DayInfo[]
  dailyStats: DailyStats
  incidents: Incident[]
  logDate: ISODate
  representativeRows: DailyLogRepresentativeRow[]
  representatives: Representative[]
}): DailyLogSummaryMetric[] {
  const {
    activeCoveragesCount,
    activeShift,
    allCalendarDaysForRelevantMonths,
    dailyStats,
    incidents,
    logDate,
    representativeRows,
    representatives,
  } = args

  const activeRepresentatives = representatives.filter(
    representative => representative.isActive !== false
  )
  const representativeById = new Map(
    activeRepresentatives.map(representative => [representative.id, representative])
  )

  const incidentsForDate = incidents.filter(incident => {
    if (incident.type === 'OVERRIDE' || incident.type === 'SWAP') {
      return false
    }

    const representative = representativeById.get(incident.representativeId)
    if (!representative) {
      return false
    }

    return resolveIncidentDates(
      incident,
      allCalendarDaysForRelevantMonths,
      representative
    ).dates.includes(logDate)
  })

  const incidentsForKpi = incidentsForDate.filter(
    incident =>
      incident.type !== 'VACACIONES' && incident.type !== 'LICENCIA'
  )

  const unavailableByType = activeRepresentatives.reduce(
    (acc, representative) => {
      const incidentsForRepresentative = incidentsForDate.filter(
        incident =>
          incident.representativeId === representative.id &&
          (incident.type === 'VACACIONES' ||
            incident.type === 'LICENCIA' ||
            incident.type === 'AUSENCIA')
      )

      const blockingType = getAvailabilityBlockingType(incidentsForRepresentative)

      if (blockingType === 'VACACIONES') acc.vacation += 1
      if (blockingType === 'LICENCIA') acc.license += 1
      if (blockingType === 'AUSENCIA') acc.absence += 1

      return acc
    },
    { vacation: 0, license: 0, absence: 0 }
  )

  const unavailableAgents =
    unavailableByType.vacation +
    unavailableByType.license +
    unavailableByType.absence
  const availableAgents = Math.max(0, activeRepresentatives.length - unavailableAgents)

  const availabilityBreakdown = [
    unavailableByType.vacation > 0
      ? `${unavailableByType.vacation} ${pluralize(unavailableByType.vacation, 'vacación', 'vacaciones')}`
      : null,
    unavailableByType.license > 0
      ? `${unavailableByType.license} ${pluralize(unavailableByType.license, 'licencia')}`
      : null,
    unavailableByType.absence > 0
      ? `${unavailableByType.absence} ${pluralize(unavailableByType.absence, 'ausencia')}`
      : null,
  ].filter(Boolean)

  const incidentsByType = incidentsForKpi.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] ?? 0) + 1
    return acc
  }, {} as Partial<Record<IncidentType, number>>)

  const incidentBreakdown = Object.entries(incidentsByType)
    .sort((left, right) => Number(right[1]) - Number(left[1]))
    .slice(0, 3)
    .map(([type, count]) =>
      `${count} ${getIncidentSummaryLabel(type as IncidentType, Number(count))}`
    )
    .join(' · ')

  const shiftPresent =
    activeShift === 'DAY' ? dailyStats.dayPresent : dailyStats.nightPresent
  const shiftPlanned =
    activeShift === 'DAY' ? dailyStats.dayPlanned : dailyStats.nightPlanned

  const uncoveredCount = representativeRows.filter(row => row.isUnassigned).length

  return [
    {
      id: 'availability',
      title: 'Disponibles hoy',
      value: `${availableAgents}`,
      caption:
        unavailableAgents === 0
          ? 'Sin vacaciones, licencias ni ausencias activas'
          : `${unavailableAgents} no disponible${unavailableAgents === 1 ? '' : 's'} · ${availabilityBreakdown.join(' · ')}`,
      tone: unavailableAgents > 0 ? 'warning' : 'accent',
    },
    {
      id: 'shift',
      title: activeShift === 'DAY' ? 'En turno día' : 'En turno noche',
      value: `${shiftPresent}/${shiftPlanned}`,
      caption:
        shiftPlanned === 0
          ? 'Sin plan operativo para este turno'
          : `${shiftPresent} presente${shiftPresent === 1 ? '' : 's'} de ${shiftPlanned} planificado${shiftPlanned === 1 ? '' : 's'}`,
      tone:
        shiftPlanned === 0
          ? 'neutral'
          : shiftPresent < shiftPlanned
            ? 'warning'
            : 'accent',
    },
    {
      id: 'incidents',
      title: 'Incidencias del día',
      value: `${incidentsForKpi.length}`,
      caption:
        incidentsForKpi.length === 0
          ? 'Sin ausencias, tardanzas, errores u otros registros hoy'
          : incidentBreakdown,
      tone: incidentsForKpi.length > 0 ? 'danger' : 'neutral',
    },
    {
      id: 'coverage',
      title: 'Coberturas activas',
      value: `${activeCoveragesCount}`,
      caption:
        uncoveredCount > 0
          ? `${uncoveredCount} turno${uncoveredCount === 1 ? '' : 's'} sin cobertura`
          : 'Sin huecos abiertos en el turno actual',
      tone:
        uncoveredCount > 0
          ? 'danger'
          : activeCoveragesCount > 0
            ? 'accent'
            : 'neutral',
    },
  ]
}

function getAvailabilityBlockingType(incidents: Incident[]) {
  if (incidents.some(incident => incident.type === 'VACACIONES')) {
    return 'VACACIONES'
  }

  if (incidents.some(incident => incident.type === 'LICENCIA')) {
    return 'LICENCIA'
  }

  if (incidents.some(incident => incident.type === 'AUSENCIA')) {
    return 'AUSENCIA'
  }

  return null
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

function getIncidentSummaryLabel(type: IncidentType, count: number) {
  switch (type) {
    case 'VACACIONES':
      return pluralize(count, 'vacación activa', 'vacaciones activas')
    case 'LICENCIA':
      return pluralize(count, 'licencia activa', 'licencias activas')
    case 'ERROR':
      return pluralize(count, 'error', 'errores')
    default:
      return pluralize(count, incidentLabel(type).toLowerCase())
  }
}
