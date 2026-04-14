'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '@/store/useAppStore'
import type { MonthlySummary } from '@/domain/analytics/types'
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store'
import { buildMonthlyRepresentativeSnapshot } from '@/ui/reports/analysis-beta/services/kpi.service'
import {
  buildPersonCalendarDays,
  getDisplayedEvents,
} from './personDetailModalHelpers'

interface UsePersonDetailModalDataParams {
  personId: string
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  summary: MonthlySummary
}

export function usePersonDetailModalData({
  personId,
  selectedDate,
  setSelectedDate,
  summary,
}: UsePersonDetailModalDataParams) {
  const { openDetailModal, representatives, allCalendarDays } = useAppStore(s => ({
    openDetailModal: s.openDetailModal,
    representatives: s.representatives,
    allCalendarDays: s.allCalendarDaysForRelevantMonths,
  }))
  const transactions = useDashboardStore(s => s.transactions)

  const normalizeName = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const currentPersonSummary = useMemo(() => {
    if (!summary || !personId) return null
    return summary.byPerson.find(person => person.representativeId === personId) ?? null
  }, [summary, personId])

  const currentRepresentative = useMemo(
    () => representatives.find(representative => representative.id === personId),
    [representatives, personId]
  )

  const commercialTotals = useMemo(() => {
    if (!currentRepresentative) {
      return {
        transactionsCount: 0,
        salesAmount: 0,
        averageTicket: 0,
      }
    }

    const monthReferenceDate = `${summary.month}-01`
    const monthlySnapshot = buildMonthlyRepresentativeSnapshot(
      transactions,
      monthReferenceDate
    )

    if (!monthlySnapshot) {
      return {
        transactionsCount: 0,
        salesAmount: 0,
        averageTicket: 0,
      }
    }

    const row = monthlySnapshot.rows.find(
      (item) => normalizeName(item.agente) === normalizeName(currentRepresentative.name)
    )

    return {
      transactionsCount: row?.transacciones ?? 0,
      salesAmount: row?.ventas ?? 0,
      averageTicket: row?.ticketPromedio ?? 0,
    }
  }, [currentRepresentative, summary.month, transactions])

  const visibleMonthDate = useMemo(
    () => parseISO(`${summary.month}-01`),
    [summary.month]
  )

  const handleMonthChange = (offset: number) => {
    const newMonth = new Date(
      visibleMonthDate.getFullYear(),
      visibleMonthDate.getMonth() + offset,
      1
    )
    openDetailModal(personId, format(newMonth, 'yyyy-MM'))
    setSelectedDate(null)
  }

  const monthLabel = useMemo(
    () => format(visibleMonthDate, 'MMMM yyyy', { locale: es }),
    [visibleMonthDate]
  )

  const displayedEvents = useMemo(
    () =>
      getDisplayedEvents({
        allCalendarDays,
        currentPersonSummary,
        currentRepresentative,
        selectedDate,
      }),
    [allCalendarDays, currentPersonSummary, currentRepresentative, selectedDate]
  )

  const calendarDays = useMemo(
    () =>
      buildPersonCalendarDays({
        allCalendarDays,
        currentPersonSummary,
        currentRepresentative,
        month: summary.month,
      }),
    [allCalendarDays, currentPersonSummary, currentRepresentative, summary.month]
  )

  return {
    allCalendarDays,
    calendarDays,
    currentPersonSummary,
    currentRepresentative,
    displayedEvents,
    monthLabel,
    visibleMonthDate,
    handleMonthChange,
    commercialTotals,
  }
}
