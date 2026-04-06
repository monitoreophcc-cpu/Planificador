'use client'

import { addMonths, format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { getStatsOverview } from '@/application/stats/getStatsOverview'
import type { WeeklyPlan } from '@/domain/types'
import { useAppStore } from '@/store/useAppStore'

export function useStatsOverviewData() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const {
    incidents,
    representatives,
    swaps,
    coverageRules,
    allCalendarDaysForRelevantMonths,
    specialSchedules,
    weeklyPlans,
  } = useAppStore(state => ({
    incidents: state.incidents,
    representatives: state.representatives,
    swaps: state.swaps,
    coverageRules: state.coverageRules,
    allCalendarDaysForRelevantMonths: state.allCalendarDaysForRelevantMonths,
    specialSchedules: state.specialSchedules,
    weeklyPlans: state.historyEvents
      .filter(event => event.category === 'PLANNING')
      .map(event => event.metadata?.weeklyPlan),
  }))

  const monthISO = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate])
  const monthLabel = useMemo(
    () => format(currentDate, 'MMMM yyyy', { locale: es }),
    [currentDate]
  )

  const weeklyPlansForMonth = useMemo(
    () =>
      weeklyPlans.filter(
        (plan): plan is WeeklyPlan => Boolean(plan?.weekStart?.startsWith(monthISO))
      ),
    [weeklyPlans, monthISO]
  )

  const monthDays = useMemo(
    () =>
      allCalendarDaysForRelevantMonths.filter(day => day.date.startsWith(monthISO)),
    [allCalendarDaysForRelevantMonths, monthISO]
  )

  const stats = useMemo(
    () =>
      getStatsOverview({
        month: monthISO,
        incidents,
        representatives,
        swaps,
        weeklyPlans: weeklyPlansForMonth,
        monthDays,
        coverageRules,
        specialSchedules,
      }),
    [
      coverageRules,
      incidents,
      monthDays,
      monthISO,
      representatives,
      specialSchedules,
      swaps,
      weeklyPlansForMonth,
    ]
  )

  return {
    monthLabel,
    stats,
    goToPreviousMonth: () => setCurrentDate(date => subMonths(date, 1)),
    goToNextMonth: () => setCurrentDate(date => addMonths(date, 1)),
  }
}
