import {
  endOfMonth,
  endOfQuarter,
  format,
  startOfMonth,
  startOfQuarter,
  subMonths,
  subYears,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { PeriodDescriptor, PeriodKind } from '@/domain/reports/operationalTypes'

function getQuarterLabel(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3)
  const year = format(date, 'yyyy')

  const quarterMonths = ['Ene-Mar', 'Abr-Jun', 'Jul-Sep', 'Oct-Dic']

  return `${quarterMonths[quarter]} ${year}`
}

function buildPeriodDescriptor(args: {
  kind: PeriodKind
  from: Date
  to: Date
}): PeriodDescriptor {
  const { kind, from, to } = args
  const fmt = (date: Date) => format(date, 'yyyy-MM-dd')

  return {
    kind,
    label:
      kind === 'MONTH'
        ? format(from, 'MMMM yyyy', { locale: es })
        : getQuarterLabel(from),
    from: fmt(from),
    to: fmt(to),
  }
}

export function buildOperationalReportPeriods(
  kind: PeriodKind,
  anchorDate: Date
) {
  const currentFrom =
    kind === 'MONTH' ? startOfMonth(anchorDate) : startOfQuarter(anchorDate)

  const currentTo =
    kind === 'MONTH' ? endOfMonth(anchorDate) : endOfQuarter(anchorDate)

  const prevFrom =
    kind === 'MONTH' ? subMonths(currentFrom, 1) : subMonths(currentFrom, 3)

  const prevTo = kind === 'MONTH' ? endOfMonth(prevFrom) : endOfQuarter(prevFrom)

  const yearAgoFrom = subYears(currentFrom, 1)
  const yearAgoTo = subYears(currentTo, 1)

  return {
    current: buildPeriodDescriptor({ kind, from: currentFrom, to: currentTo }),
    previous: buildPeriodDescriptor({ kind, from: prevFrom, to: prevTo }),
    yearAgo: buildPeriodDescriptor({ kind, from: yearAgoFrom, to: yearAgoTo }),
  }
}
