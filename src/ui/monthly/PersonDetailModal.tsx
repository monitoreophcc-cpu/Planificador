'use client'

import { useEffect, useState } from 'react'
import type { MonthlySummary } from '@/domain/analytics/types'
import { PersonDetailModalContent } from './PersonDetailModalContent'
import { PersonDetailModalShell } from './PersonDetailModalShell'
import { usePersonDetailModalData } from './usePersonDetailModalData'

export function PersonDetailModal({
  summary,
  personId,
  onClose,
}: {
  summary: MonthlySummary
  personId: string
  onClose: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Manage body scroll and escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const {
    allCalendarDays,
    calendarDays,
    currentPersonSummary,
    currentRepresentative,
    displayedEvents,
    commercialTotals,
    monthLabel,
    visibleMonthDate,
    handleMonthChange,
  } = usePersonDetailModalData({
    personId,
    selectedDate,
    setSelectedDate,
    summary,
  })

  return (
    <PersonDetailModalShell onClose={onClose}>
    <PersonDetailModalContent
      allCalendarDays={allCalendarDays}
      calendarDays={calendarDays}
      currentPersonSummary={currentPersonSummary ?? null}
      currentRepresentative={currentRepresentative}
      displayedEvents={displayedEvents}
      commercialTotals={commercialTotals}
      monthLabel={monthLabel}
      onClose={onClose}
      onMonthChange={handleMonthChange}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      visibleMonthDate={visibleMonthDate}
    />
    </PersonDetailModalShell>
  )
}
