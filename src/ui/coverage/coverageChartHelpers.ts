import type { ISODate } from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'

export function getCoverageChartDates(
  data: Record<ISODate, EffectiveCoverageResult>
) {
  return Object.keys(data).sort() as ISODate[]
}

export function getCoverageChartMaxCoverage(
  data: Record<ISODate, EffectiveCoverageResult>
) {
  return Math.max(
    1,
    ...Object.values(data).map(day => Math.max(day.actual, day.required))
  )
}

export function getCoverageChartBarHeight(actual: number, maxCoverage: number) {
  return maxCoverage > 0 ? (actual / maxCoverage) * 100 : 0
}

export function getCoverageChartBarColor(isDeficit: boolean) {
  return isDeficit ? 'hsl(350, 80%, 60%)' : 'hsl(142.1, 76.2%, 40%)'
}

export function getCoverageChartCountColor(isDeficit: boolean) {
  return isDeficit ? 'hsl(350, 80%, 50%)' : '#111827'
}

export function formatCoverageChartDate(date: ISODate) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
  })
}

export function buildCoverageChartLinePoints(args: {
  data: Record<ISODate, EffectiveCoverageResult>
  dates: ISODate[]
  maxCoverage: number
}) {
  const { data, dates, maxCoverage } = args

  return dates
    .map((date, index) => {
      const required = data[date]?.required ?? 0
      const y = (1 - (maxCoverage > 0 ? required / maxCoverage : 0)) * 100
      const x = (index + 0.5) * (100 / dates.length)
      return `${x},${y}`
    })
    .join(' ')
}
