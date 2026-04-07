import type {
  CoverageRule,
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
  SpecialSchedule,
  SwapEvent,
  WeeklyPlan,
} from '@/domain/types'
import { getEffectiveDailyCoverage } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import type { CoverageRiskResult, DailyDeficitDetail } from './getCoverageRiskSummary'

export interface CoverageRiskDayStat {
  totalDeficit: number
  hasDeficit: boolean
  shiftDeficits: {
    DAY: { deficit: number; actual: number; required: number } | null
    NIGHT: { deficit: number; actual: number; required: number } | null
  }
}

export function createEmptyCoverageRiskResult(totalDays: number): CoverageRiskResult {
  return {
    totalDays,
    daysWithDeficit: 0,
    criticalDeficitDays: 0,
    totalDeficit: 0,
    worstShift: { shift: null, deficit: 0 },
    dailyDeficits: [],
  }
}

export function findPlanForDate(
  weeklyPlans: WeeklyPlan[],
  date: ISODate
): WeeklyPlan | undefined {
  return weeklyPlans.find(plan => {
    const start = new Date(`${plan.weekStart}T00:00:00`)
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    const target = new Date(`${date}T00:00:00`)
    return target >= start && target < end
  })
}

interface BuildCoverageDayStatsParams {
  coverageRules: CoverageRule[]
  incidents: Incident[]
  monthDays: DayInfo[]
  representatives: Representative[]
  specialSchedules?: SpecialSchedule[]
  swaps: SwapEvent[]
  weeklyPlans: WeeklyPlan[]
}

export function buildCoverageDayStats({
  coverageRules,
  incidents,
  monthDays,
  representatives,
  specialSchedules,
  swaps,
  weeklyPlans,
}: BuildCoverageDayStatsParams) {
  const dayStats = new Map<ISODate, CoverageRiskDayStat>()

  for (const day of monthDays) {
    const plan = findPlanForDate(weeklyPlans, day.date)
    if (!plan) {
      continue
    }

    const coverage = getEffectiveDailyCoverage(
      plan,
      swaps,
      coverageRules,
      day.date,
      incidents,
      monthDays,
      representatives || [],
      specialSchedules
    )

    let stats = dayStats.get(day.date)
    if (!stats) {
      stats = {
        totalDeficit: 0,
        hasDeficit: false,
        shiftDeficits: { DAY: null, NIGHT: null },
      }
      dayStats.set(day.date, stats)
    }

    for (const shift of ['DAY', 'NIGHT'] as ShiftType[]) {
      const { required, actual } = coverage[shift]
      const deficit = Math.max(0, required - actual)

      if (deficit > 0) {
        stats.totalDeficit += deficit
        stats.hasDeficit = true
        stats.shiftDeficits[shift] = { deficit, actual, required }
      }
    }
  }

  return dayStats
}

export function summarizeCoverageDeficits(
  dayStats: Map<ISODate, CoverageRiskDayStat>,
  isCriticalScenario: boolean
) {
  let daysWithDeficit = 0
  let criticalDeficitDays = 0
  let totalDeficit = 0
  const shiftSum = { DAY: 0, NIGHT: 0 }
  const dailyDeficits: DailyDeficitDetail[] = []

  for (const [date, stat] of dayStats.entries()) {
    if (!stat.hasDeficit) {
      continue
    }

    daysWithDeficit += 1
    totalDeficit += stat.totalDeficit
    if (stat.totalDeficit > 2) {
      criticalDeficitDays += 1
    }

    if (stat.shiftDeficits.DAY) {
      shiftSum.DAY += stat.shiftDeficits.DAY.deficit
    }
    if (stat.shiftDeficits.NIGHT) {
      shiftSum.NIGHT += stat.shiftDeficits.NIGHT.deficit
    }

    const deficitsForDay: Array<{
      shift: ShiftType
      deficit: number
      actual: number
      required: number
    }> = []

    if (stat.shiftDeficits.DAY) {
      deficitsForDay.push({ ...stat.shiftDeficits.DAY, shift: 'DAY' })
    }
    if (stat.shiftDeficits.NIGHT) {
      deficitsForDay.push({ ...stat.shiftDeficits.NIGHT, shift: 'NIGHT' })
    }

    if (isCriticalScenario) {
      deficitsForDay.forEach(deficit => {
        dailyDeficits.push({
          date,
          shift: deficit.shift,
          deficit: deficit.deficit,
          actual: deficit.actual,
          required: deficit.required,
        })
      })
      continue
    }

    if (deficitsForDay.length > 0) {
      const worstShiftForDay = deficitsForDay.sort(
        (left, right) => right.deficit - left.deficit
      )[0]

      dailyDeficits.push({
        date,
        shift: worstShiftForDay.shift,
        deficit: worstShiftForDay.deficit,
        actual: worstShiftForDay.actual,
        required: worstShiftForDay.required,
      })
    }
  }

  const worstShift =
    shiftSum.DAY > shiftSum.NIGHT
      ? { shift: 'DAY' as const, deficit: shiftSum.DAY }
      : shiftSum.NIGHT > 0
        ? { shift: 'NIGHT' as const, deficit: shiftSum.NIGHT }
        : { shift: null, deficit: 0 }

  return {
    criticalDeficitDays,
    dailyDeficits: dailyDeficits.sort((left, right) =>
      left.date.localeCompare(right.date)
    ),
    daysWithDeficit,
    totalDeficit,
    worstShift,
  }
}
