import type {
  CommercialGoal,
  Incident,
  Representative,
  ShiftType,
} from '@/domain/types'
import { getCommercialGoalTarget } from '@/domain/commercialGoals/defaults'
import type {
  OperationalCompetitiveComparisonPreset,
  OperationalCompetitiveReport,
  OperationalCompetitiveRepresentativeRow,
  OperationalCompetitiveResolvedPeriod,
} from '@/domain/reports/operationalTypes'
import type { Transaction } from '@/ui/reports/analysis-beta/types/dashboard.types'
import { getShift } from '@/ui/reports/analysis-beta/services/shift.service'
import type { ManualRepresentativeLink } from '@/ui/reports/analysis-beta/services/representative-link.service'

const SHIFT_LABELS: Record<ShiftType, string> = {
  DAY: 'Turno Día',
  NIGHT: 'Turno Noche',
}

const SEGMENT_LABELS = {
  PART_TIME: 'Part Time',
  FULL_TIME: 'Full Time',
  MIXTO: 'Mixto',
} as const

type InternalRow = OperationalCompetitiveRepresentativeRow & {
  comparisonValidTransactions: number
  comparisonTarget: number
}

type IncidentBreakdown = {
  incidents: number
  errors: number
  absences: number
  tardiness: number
}

type BuilderInput = {
  representatives: Representative[]
  incidents: Incident[]
  commercialGoals: CommercialGoal[]
  currentPeriod: OperationalCompetitiveResolvedPeriod
  currentTransactionDates?: string[]
  comparisonPreset?: OperationalCompetitiveComparisonPreset
  comparisonPeriod?: OperationalCompetitiveResolvedPeriod | null
  comparisonTransactionDates?: string[]
  currentTransactions: Transaction[]
  comparisonTransactions?: Transaction[]
  manualRepresentativeLinks?: ManualRepresentativeLink[]
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function isRepresentativeTransaction(transaction: Transaction): boolean {
  if (transaction.agenteTipo) {
    return transaction.agenteTipo === 'agente'
  }

  if (!transaction.agente) {
    return false
  }

  return !transaction.plataformaCode || transaction.plataformaCode === 'CC'
}

function resolveTransactionShift(time: string): ShiftType | null {
  const shift = getShift(time)

  if (shift === 'Día') {
    return 'DAY'
  }

  if (shift === 'Noche') {
    return 'NIGHT'
  }

  return null
}

function createRepresentativeResolver(
  representatives: Representative[],
  manualLinks: ManualRepresentativeLink[]
) {
  const representativesByNormalizedName = new Map(
    representatives.map(representative => [
      normalizeName(representative.name),
      representative,
    ])
  )
  const manualLinksByAgentName = new Map(
    manualLinks.map(link => [
      normalizeName(link.agentName),
      normalizeName(link.representativeName),
    ])
  )

  return (agentName: string | undefined): Representative | null => {
    if (!agentName) {
      return null
    }

    const normalizedAgentName = normalizeName(agentName)
    const manualRepresentativeName = manualLinksByAgentName.get(normalizedAgentName)

    if (manualRepresentativeName) {
      return representativesByNormalizedName.get(manualRepresentativeName) ?? null
    }

    return representativesByNormalizedName.get(normalizedAgentName) ?? null
  }
}

function daysInMonthFromIso(date: string): number {
  const [year, month] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function getProratedTarget(params: {
  commercialGoals: CommercialGoal[]
  dates: string[]
  shift: ShiftType
  segment: InternalRow['segment']
}): number {
  const monthlyTarget = getCommercialGoalTarget(
    params.commercialGoals,
    params.shift,
    params.segment
  )

  if (monthlyTarget <= 0 || params.dates.length === 0) {
    return 0
  }

  return params.dates.reduce(
    (total, date) => total + monthlyTarget / daysInMonthFromIso(date),
    0
  )
}

function buildPeriodDateSet(period: OperationalCompetitiveResolvedPeriod) {
  return new Set(period.loadedDates)
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const nextDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1))
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

function incidentTouchesLoadedPeriod(
  incident: Incident,
  periodDateSet: Set<string>
): boolean {
  for (let dayOffset = 0; dayOffset < Math.max(incident.duration, 1); dayOffset += 1) {
    if (periodDateSet.has(addDays(incident.startDate, dayOffset))) {
      return true
    }
  }

  return false
}

function buildIncidentShiftMap(params: {
  incidents: Incident[]
  representativesById: Map<string, Representative>
  period: OperationalCompetitiveResolvedPeriod
}) {
  const incidentCounts = new Map<string, IncidentBreakdown>()
  const periodDateSet = buildPeriodDateSet(params.period)

  params.incidents.forEach(incident => {
    if (!incidentTouchesLoadedPeriod(incident, periodDateSet)) {
      return
    }

    const representative = params.representativesById.get(incident.representativeId)
    if (!representative) {
      return
    }

    const shift =
      incident.assignment?.type === 'SINGLE'
        ? incident.assignment.shift
        : representative.baseShift
    const key = `${representative.id}:${shift}`
    const current = incidentCounts.get(key) ?? {
      incidents: 0,
      errors: 0,
      absences: 0,
      tardiness: 0,
    }

    switch (incident.type) {
      case 'ERROR':
        current.errors += 1
        current.incidents += 1
        break
      case 'AUSENCIA':
        current.absences += 1
        current.incidents += 1
        break
      case 'TARDANZA':
        current.tardiness += 1
        current.incidents += 1
        break
      default:
        return
    }

    incidentCounts.set(key, current)
  })

  return incidentCounts
}

function buildTransactionStats(params: {
  transactions: Transaction[]
  representatives: Representative[]
  manualRepresentativeLinks: ManualRepresentativeLink[]
  collectWarnings: boolean
}) {
  const resolveRepresentative = createRepresentativeResolver(
    params.representatives,
    params.manualRepresentativeLinks
  )
  const stats = new Map<
    string,
    { validTransactions: number; cancelledTransactions: number }
  >()
  const pendingAgentNames: Record<ShiftType, Set<string>> = {
    DAY: new Set<string>(),
    NIGHT: new Set<string>(),
  }
  const missingAgentRegistrations: Record<ShiftType, number> = {
    DAY: 0,
    NIGHT: 0,
  }

  params.transactions.forEach(transaction => {
    const shift = resolveTransactionShift(transaction.hora)

    if (!shift || !isRepresentativeTransaction(transaction)) {
      return
    }

    const representative = resolveRepresentative(transaction.agente)

    if (!representative) {
      if (params.collectWarnings) {
        if (transaction.agente) {
          pendingAgentNames[shift].add(transaction.agente)
        } else {
          missingAgentRegistrations[shift] += 1
        }
      }
      return
    }

    const key = `${representative.id}:${shift}`
    const current = stats.get(key) ?? {
      validTransactions: 0,
      cancelledTransactions: 0,
    }

    if (transaction.estatus === 'N') {
      current.validTransactions += 1
    } else {
      current.cancelledTransactions += 1
    }

    stats.set(key, current)
  })

  return {
    stats,
    pendingAgentNames,
    missingAgentRegistrations,
  }
}

function sortRows(rows: InternalRow[]) {
  return [...rows].sort((left, right) => {
    if (right.validTransactions !== left.validTransactions) {
      return right.validTransactions - left.validTransactions
    }

    if (right.progressPct !== left.progressPct) {
      return right.progressPct - left.progressPct
    }

    if (left.incidents !== right.incidents) {
      return left.incidents - right.incidents
    }

    if (left.cancelledTransactions !== right.cancelledTransactions) {
      return left.cancelledTransactions - right.cancelledTransactions
    }

    return left.name.localeCompare(right.name, 'es')
  })
}

export function buildOperationalCompetitiveReport({
  representatives,
  incidents,
  commercialGoals,
  currentPeriod,
  currentTransactionDates,
  comparisonPreset = 'NONE',
  comparisonPeriod = null,
  comparisonTransactionDates,
  currentTransactions,
  comparisonTransactions = [],
  manualRepresentativeLinks = [],
}: BuilderInput): OperationalCompetitiveReport {
  const eligibleRepresentatives = representatives.filter(
    representative =>
      representative.isActive !== false && representative.commercialEligible === true
  )
  const representativesById = new Map(
    eligibleRepresentatives.map(representative => [representative.id, representative])
  )
  const currentIncidentMap = buildIncidentShiftMap({
    incidents,
    representativesById,
    period: currentPeriod,
  })
  const currentTransactionState = buildTransactionStats({
    transactions: currentTransactions,
    representatives: eligibleRepresentatives,
    manualRepresentativeLinks,
    collectWarnings: true,
  })
  const comparisonTransactionState = buildTransactionStats({
    transactions: comparisonTransactions,
    representatives: eligibleRepresentatives,
    manualRepresentativeLinks,
    collectWarnings: false,
  })

  const tables = (['DAY', 'NIGHT'] as const).reduce<
    OperationalCompetitiveReport['tables']
  >(
    (accumulator, shift) => {
      const rows: InternalRow[] = eligibleRepresentatives.flatMap(representative => {
        const currentStats =
          currentTransactionState.stats.get(`${representative.id}:${shift}`) ?? {
            validTransactions: 0,
            cancelledTransactions: 0,
          }
        const comparisonStats =
          comparisonTransactionState.stats.get(`${representative.id}:${shift}`) ?? {
            validTransactions: 0,
            cancelledTransactions: 0,
          }
        const incidentStats = currentIncidentMap.get(`${representative.id}:${shift}`) ?? {
          incidents: 0,
          errors: 0,
          absences: 0,
          tardiness: 0,
        }
        const hasShiftActivity =
          currentStats.validTransactions + currentStats.cancelledTransactions > 0
        const shouldRenderInShift =
          representative.baseShift === shift || hasShiftActivity

        if (!shouldRenderInShift) {
          return []
        }

        const segment =
          representative.mixProfile && hasShiftActivity
            ? 'MIXTO'
            : representative.employmentType === 'PART_TIME'
              ? 'PART_TIME'
              : 'FULL_TIME'
        const target = getProratedTarget({
          commercialGoals,
          dates: currentTransactionDates ?? currentPeriod.loadedDates,
          shift,
          segment,
        })
        const comparisonTarget = comparisonPeriod
          ? getProratedTarget({
              commercialGoals,
              dates: comparisonTransactionDates ?? comparisonPeriod.loadedDates,
              shift,
              segment,
            })
          : 0
        const progressPct =
          target > 0 ? (currentStats.validTransactions / target) * 100 : 0
        const comparisonProgressPct =
          comparisonTarget > 0
            ? (comparisonStats.validTransactions / comparisonTarget) * 100
            : 0

        return [
          {
            representativeId: representative.id,
            name: representative.name,
            shift,
            segment,
            target,
            validTransactions: currentStats.validTransactions,
            cancelledTransactions: currentStats.cancelledTransactions,
            incidents: incidentStats.incidents,
            errors: incidentStats.errors,
            absences: incidentStats.absences,
            tardiness: incidentStats.tardiness,
            progressPct,
            comparisonDelta:
              comparisonPreset === 'NONE'
                ? null
                : currentStats.validTransactions - comparisonStats.validTransactions,
            hasUnlinkedDataWarning:
              currentTransactionState.pendingAgentNames[shift].size > 0 ||
              currentTransactionState.missingAgentRegistrations[shift] > 0,
            comparisonValidTransactions: comparisonStats.validTransactions,
            comparisonTarget,
          },
        ]
      })

      const segments = (['PART_TIME', 'FULL_TIME', 'MIXTO'] as const).map(segment => {
        const segmentRows = sortRows(rows.filter(row => row.segment === segment))
        const target = segmentRows.reduce((total, row) => total + row.target, 0)
        const validTransactions = segmentRows.reduce(
          (total, row) => total + row.validTransactions,
          0
        )
        const cancelledTransactions = segmentRows.reduce(
          (total, row) => total + row.cancelledTransactions,
          0
        )
        const incidents = segmentRows.reduce((total, row) => total + row.incidents, 0)
        const errors = segmentRows.reduce((total, row) => total + row.errors, 0)
        const absences = segmentRows.reduce((total, row) => total + row.absences, 0)
        const tardiness = segmentRows.reduce((total, row) => total + row.tardiness, 0)
        const comparisonValidTransactions = segmentRows.reduce(
          (total, row) => total + row.comparisonValidTransactions,
          0
        )
        const comparisonTarget = segmentRows.reduce(
          (total, row) => total + row.comparisonTarget,
          0
        )
        const progressPct = target > 0 ? (validTransactions / target) * 100 : 0
        const comparisonProgressPct =
          comparisonTarget > 0
            ? (comparisonValidTransactions / comparisonTarget) * 100
            : 0

        return {
          segment,
          label: SEGMENT_LABELS[segment],
          summary: {
            segment,
            label: SEGMENT_LABELS[segment],
            representatives: segmentRows.length,
            target,
            validTransactions,
            cancelledTransactions,
            incidents,
            errors,
            absences,
            tardiness,
            progressPct,
            comparisonDelta:
              comparisonPreset === 'NONE'
                ? null
                : validTransactions - comparisonValidTransactions,
          },
          rows: segmentRows.map(
            ({
              comparisonTarget: _comparisonTarget,
              comparisonValidTransactions: _comparisonValidTransactions,
              ...row
            }) => row
          ),
        }
      })

      accumulator[shift] = {
        shift,
        label: SHIFT_LABELS[shift],
        segments,
        pendingAgentNames: [...currentTransactionState.pendingAgentNames[shift]].sort(
          (left, right) => left.localeCompare(right, 'es')
        ),
        missingAgentRegistrations:
          currentTransactionState.missingAgentRegistrations[shift],
      }
      return accumulator
    },
    {
      DAY: {
        shift: 'DAY',
        label: SHIFT_LABELS.DAY,
        segments: [],
        pendingAgentNames: [],
        missingAgentRegistrations: 0,
      },
      NIGHT: {
        shift: 'NIGHT',
        label: SHIFT_LABELS.NIGHT,
        segments: [],
        pendingAgentNames: [],
        missingAgentRegistrations: 0,
      },
    }
  )

  const pendingAgentNames = [
    ...new Set([...tables.DAY.pendingAgentNames, ...tables.NIGHT.pendingAgentNames]),
  ].sort((left, right) => left.localeCompare(right, 'es'))
  const dataQualityWarnings: string[] = []

  ;(['DAY', 'NIGHT'] as const).forEach(shift => {
    if (tables[shift].pendingAgentNames.length > 0) {
      dataQualityWarnings.push(
        `${SHIFT_LABELS[shift]}: ${tables[shift].pendingAgentNames.length} agente(s) sin enlace manual.`
      )
    }

    if (tables[shift].missingAgentRegistrations > 0) {
      dataQualityWarnings.push(
        `${SHIFT_LABELS[shift]}: ${tables[shift].missingAgentRegistrations} transacción(es) sin agente identificado.`
      )
    }
  })

  return {
    currentPeriod,
    comparisonPreset,
    comparisonPeriod,
    tables,
    pendingAgentNames,
    dataQualityWarnings,
  }
}
