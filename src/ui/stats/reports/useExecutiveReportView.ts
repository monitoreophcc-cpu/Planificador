'use client'

import { useMemo, useState } from 'react'
import { format, startOfQuarter, subDays } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { selectExecutiveReport } from '@/store/selectors/selectExecutiveReport'

export type ExecutiveReportPeriod = number | 'quarter'

export const EXECUTIVE_REPORT_PERIOD_OPTIONS: Array<{
  label: string
  value: ExecutiveReportPeriod
}> = [
  { label: 'Últimos 7 días', value: 7 },
  { label: 'Últimos 30 días', value: 30 },
  { label: 'Este Trimestre', value: 'quarter' },
  { label: 'Últimos 90 días', value: 90 },
]

export function useExecutiveReportView() {
  const [period, setPeriod] = useState<ExecutiveReportPeriod>(30)

  const { from, to } = useMemo(() => {
    const endDate = new Date()
    const startDate =
      period === 'quarter' ? startOfQuarter(endDate) : subDays(endDate, period)

    return {
      from: format(startDate, 'yyyy-MM-dd'),
      to: format(endDate, 'yyyy-MM-dd'),
    }
  }, [period])

  const report = useAppStore(state => selectExecutiveReport(state, from, to))

  return {
    period,
    report,
    setPeriod,
  }
}
