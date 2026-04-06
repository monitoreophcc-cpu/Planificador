'use client'

import { useMemo, useState } from 'react'
import { addMonths, format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '@/store/useAppStore'
import { getCoverageRiskSummary } from '@/application/stats/getCoverageRiskSummary'
import { getWeeklyPlansForMonth } from './coverageRiskViewHelpers'

export function useCoverageRiskViewData() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const {
    swaps,
    coverageRules,
    allCalendarDaysForRelevantMonths,
    historyEvents,
    incidents,
    representatives,
  } = useAppStore(state => ({
    swaps: state.swaps,
    coverageRules: state.coverageRules,
    allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    historyEvents: state.historyEvents,
    incidents: state.incidents,
    representatives: state.representatives,
  }))

  const monthISO = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate])
  const monthLabel = useMemo(
    () => format(currentDate, 'MMMM yyyy', { locale: es }),
    [currentDate]
  )

  const weeklyPlansForMonth = useMemo(
    () => getWeeklyPlansForMonth(historyEvents, monthISO),
    [historyEvents, monthISO]
  )

  const riskSummary = useMemo(
    () =>
      getCoverageRiskSummary({
        monthDays: allCalendarDaysForRelevantMonths.filter(day =>
          day.date.startsWith(monthISO)
        ),
        weeklyPlans: weeklyPlansForMonth,
        swaps,
        coverageRules,
        incidents,
        representatives,
      }),
    [
      allCalendarDaysForRelevantMonths,
      coverageRules,
      incidents,
      monthISO,
      representatives,
      swaps,
      weeklyPlansForMonth,
    ]
  )

  return {
    monthLabel,
    riskSummary,
    goToNextMonth: () => setCurrentDate(current => addMonths(current, 1)),
    goToPreviousMonth: () => setCurrentDate(current => subMonths(current, 1)),
  }
}
