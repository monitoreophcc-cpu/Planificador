import { parseISO } from 'date-fns'
import {
  createAnalysisPeriod,
  getPreviousPeriod,
} from '@/domain/analysis/analysisPeriod'
import type {
  AnalysisPeriod,
  ComparisonMode,
  PeriodKind,
} from '@/domain/analysis/analysisTypes'
import type { AnalysisParams } from '@/store/selectors/selectOperationalAnalysis'

export interface PeriodSelection {
  kind: PeriodKind
  year: number
  month?: number
  quarter?: 1 | 2 | 3 | 4
}

export function createDefaultBasePeriod(date = new Date()): PeriodSelection {
  return {
    kind: 'MONTH',
    year: date.getFullYear(),
    month: date.getMonth(),
  }
}

export function createDefaultCustomPeriod(date = new Date()): PeriodSelection {
  const previousMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1)

  return {
    kind: 'MONTH',
    year: previousMonthDate.getFullYear(),
    month: previousMonthDate.getMonth(),
  }
}

export function buildPreviousSelection(
  basePeriod: PeriodSelection
): PeriodSelection {
  const previousPeriod = getPreviousPeriod(toAnalysisPeriod(basePeriod))
  return periodSelectionFromAnalysisPeriod(previousPeriod)
}

export function buildAnalysisParams(
  basePeriod: PeriodSelection,
  comparisonMode: ComparisonMode,
  customPeriod: PeriodSelection
): AnalysisParams {
  const base = toAnalysisPeriod(basePeriod)

  if (comparisonMode === 'CUSTOM') {
    return {
      base,
      mode: comparisonMode,
      compared: toAnalysisPeriod({
        ...customPeriod,
        kind: basePeriod.kind,
      }),
    }
  }

  return {
    base,
    mode: comparisonMode,
  }
}

function toAnalysisPeriod(period: PeriodSelection): AnalysisPeriod {
  if (period.kind === 'MONTH') {
    return createAnalysisPeriod({
      kind: 'MONTH',
      year: period.year,
      month: period.month ?? 0,
    })
  }

  return createAnalysisPeriod({
    kind: 'QUARTER',
    year: period.year,
    quarter: (period.quarter ?? 1) as 1 | 2 | 3 | 4,
  })
}

function periodSelectionFromAnalysisPeriod(
  period: AnalysisPeriod
): PeriodSelection {
  const from = parseISO(period.from)

  if (period.kind === 'MONTH') {
    return {
      kind: 'MONTH',
      year: period.year,
      month: from.getMonth(),
    }
  }

  return {
    kind: 'QUARTER',
    year: period.year,
    quarter: (Math.floor(from.getMonth() / 3) + 1) as 1 | 2 | 3 | 4,
  }
}
