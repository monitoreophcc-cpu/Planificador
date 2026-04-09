import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import type { PlannerAssignmentsMap } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import type { DayInfo, Incident, ISODate, Representative } from '@/domain/types'
import type { ShiftType } from '@/domain/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type MetricTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface PlannerOperationalMetrics {
  compactWeekLabel: string
  focusCoverageTitle: string
  focusCoverageActual: number
  focusCoverageRequired: number
  focusCoverageCaption: string
  focusDate: ISODate | null
  weeklyStatusLabel: string
  weeklyStatusTone: MetricTone
  weeklyStatusDetail: string
  weeklyAbsences: number
  justifiedAbsences: number
  unjustifiedAbsences: number
  focusAvailabilityTitle: string
  availableAgents: number
  unavailableAgents: number
  blockedByVacation: number
  blockedByLicense: number
  blockedByAbsence: number
  availabilityCaption: string
  minimumLabel: string
}

function parseISODate(date: ISODate) {
  return new Date(`${date}T12:00:00Z`)
}

function formatShortDay(date: ISODate) {
  return format(parseISODate(date), 'eee d', { locale: es }).replace('.', '')
}

export function getCoverageTone(
  coverage?: EffectiveCoverageResult
): MetricTone {
  if (!coverage || coverage.required <= 0) return 'neutral'
  if (coverage.actual < coverage.required) return 'danger'
  if (coverage.actual === coverage.required) return 'warning'
  return 'success'
}

export function formatCompactWeekLabel(weekDays: DayInfo[]) {
  if (weekDays.length === 0) return 'semana actual'

  const start = parseISODate(weekDays[0].date)
  const end = parseISODate(weekDays[weekDays.length - 1].date)
  const startMonth = format(start, 'LLL', { locale: es }).replace('.', '')
  const endMonth = format(end, 'LLL', { locale: es }).replace('.', '')

  if (startMonth === endMonth) {
    return `semana ${format(start, 'd')}–${format(end, 'd')} ${endMonth}`
  }

  return `semana ${format(start, 'd')} ${startMonth}–${format(end, 'd')} ${endMonth}`
}

export function getPlannerOperationalMetrics(args: {
  activeShift: ShiftType
  assignmentsMap: PlannerAssignmentsMap
  coverageData: Record<ISODate, EffectiveCoverageResult>
  incidents: Incident[]
  isCurrentWeek: boolean
  representatives: Representative[]
  weekDays: DayInfo[]
}): PlannerOperationalMetrics {
  const {
    activeShift,
    assignmentsMap,
    coverageData,
    incidents,
    isCurrentWeek,
    representatives,
    weekDays,
  } = args
  const activeRepresentatives = representatives.filter(rep => rep.isActive !== false)
  const compactWeekLabel = formatCompactWeekLabel(weekDays)
  const weekDateSet = new Set(weekDays.map(day => day.date))
  const todayIso = format(new Date(), 'yyyy-MM-dd') as ISODate
  const focusDate =
    weekDateSet.has(todayIso) && isCurrentWeek ? todayIso : weekDays[0]?.date ?? null
  const focusCoverage = focusDate ? coverageData[focusDate] : undefined
  const coverageEntries = Object.values(coverageData).filter(day => day.required > 0)
  const deficitDays = coverageEntries.filter(day => day.actual < day.required).length
  const exactDays = coverageEntries.filter(day => day.actual === day.required).length
  const worstGap = coverageEntries.reduce(
    (worst, day) => Math.min(worst, day.actual - day.required),
    0
  )
  const absences = incidents.filter(
    incident =>
      incident.type === 'AUSENCIA' && weekDateSet.has(incident.startDate)
  )
  const justifiedAbsences = absences.filter(
    incident => incident.details === 'JUSTIFICADA'
  ).length
  const unjustifiedAbsences = absences.length - justifiedAbsences
  const minRequired = coverageEntries.length
    ? Math.min(...coverageEntries.map(day => day.required))
    : 0
  const maxRequired = coverageEntries.length
    ? Math.max(...coverageEntries.map(day => day.required))
    : 0

  let weeklyStatusLabel = 'Sin cobertura'
  let weeklyStatusTone: MetricTone = 'neutral'
  let weeklyStatusDetail = 'Sin reglas de cobertura activas'

  if (coverageEntries.length > 0) {
    if (deficitDays > 0) {
      weeklyStatusLabel = 'Cobertura Baja'
      weeklyStatusTone = 'danger'
      weeklyStatusDetail = `${deficitDays} día${deficitDays === 1 ? '' : 's'} bajo mínimo · peor brecha ${worstGap}`
    } else if (exactDays === coverageEntries.length) {
      weeklyStatusLabel = 'Cobertura Justa'
      weeklyStatusTone = 'warning'
      weeklyStatusDetail = `Toda la semana quedó en el mínimo requerido`
    } else {
      weeklyStatusLabel = 'Cobertura OK'
      weeklyStatusTone = 'success'
      if (focusDate && focusCoverage) {
        const prefix = focusDate === todayIso && isCurrentWeek ? 'Hoy' : formatShortDay(focusDate)
        weeklyStatusDetail = `${prefix}: ${focusCoverage.actual} en turno · mín. ${focusCoverage.required}`
      } else {
        weeklyStatusDetail = 'Semana cubierta por encima del mínimo'
      }
    }
  }

  const minimumLabel =
    coverageEntries.length === 0
      ? 'Sin regla'
      : minRequired === maxRequired
        ? `${minRequired}`
        : `${minRequired}-${maxRequired}`

  const availabilityBlockers = focusDate
    ? activeRepresentatives.reduce(
        (acc, rep) => {
          const duty = assignmentsMap[rep.id]?.[focusDate]?.[activeShift]

          if (duty?.reason === 'VACACIONES') acc.vacation += 1
          else if (duty?.reason === 'LICENCIA') acc.license += 1
          else if (duty?.reason === 'AUSENCIA') acc.absence += 1

          return acc
        },
        { vacation: 0, license: 0, absence: 0 }
      )
    : { vacation: 0, license: 0, absence: 0 }

  const unavailableAgents =
    availabilityBlockers.vacation +
    availabilityBlockers.license +
    availabilityBlockers.absence
  const availableAgents = Math.max(0, activeRepresentatives.length - unavailableAgents)
  const availabilityBreakdown = [
    availabilityBlockers.vacation > 0 ? `${availabilityBlockers.vacation} VAC` : null,
    availabilityBlockers.license > 0 ? `${availabilityBlockers.license} LIC` : null,
    availabilityBlockers.absence > 0 ? `${availabilityBlockers.absence} AUS` : null,
  ].filter(Boolean)
  const availabilityCaption =
    unavailableAgents === 0
      ? 'Sin vacaciones, licencias ni ausencias'
      : `${unavailableAgents} no disponible${unavailableAgents === 1 ? '' : 's'} · ${availabilityBreakdown.join(' · ')}`

  return {
    compactWeekLabel,
    focusCoverageTitle:
      focusDate && focusDate === todayIso && isCurrentWeek
        ? 'EN TURNO HOY'
        : focusDate
          ? `EN TURNO ${formatShortDay(focusDate).toUpperCase()}`
          : 'EN TURNO',
    focusCoverageActual: focusCoverage?.actual ?? 0,
    focusCoverageRequired: focusCoverage?.required ?? 0,
    focusCoverageCaption:
      focusCoverage && focusDate
        ? `Mínimo requerido: ${focusCoverage.required}`
        : 'Sin regla activa',
    focusDate,
    weeklyStatusLabel,
    weeklyStatusTone,
    weeklyStatusDetail,
    weeklyAbsences: absences.length,
    justifiedAbsences,
    unjustifiedAbsences,
    focusAvailabilityTitle:
      focusDate && focusDate === todayIso && isCurrentWeek
        ? 'DISPONIBLES HOY'
        : focusDate
          ? `DISPONIBLES ${formatShortDay(focusDate).toUpperCase()}`
          : 'DISPONIBLES',
    availableAgents,
    unavailableAgents,
    blockedByVacation: availabilityBlockers.vacation,
    blockedByLicense: availabilityBlockers.license,
    blockedByAbsence: availabilityBlockers.absence,
    availabilityCaption,
    minimumLabel,
  }
}
