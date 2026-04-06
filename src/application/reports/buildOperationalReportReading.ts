import type { PeriodMetrics } from '@/domain/reports/operationalTypes'

export function buildOperationalReading(args: {
  currentMetrics: PeriodMetrics
  previousMetrics: PeriodMetrics
}) {
  const { currentMetrics, previousMetrics } = args

  return currentMetrics.incidents > previousMetrics.incidents
    ? 'El período muestra un deterioro operativo respecto al período anterior.'
    : 'El período muestra una mejora o estabilidad respecto al período anterior.'
}
