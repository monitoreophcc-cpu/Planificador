'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MonthlySummary } from '@/domain/analytics/types'
import {
  format,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { type CalendarDay } from '../components/CalendarGrid'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import { PersonDetailModalContent } from './PersonDetailModalContent'

export function PersonDetailModal({
  summary,
  personId,
  onClose,
}: {
  summary: MonthlySummary
  personId: string
  onClose: () => void
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { openDetailModal, representatives, allCalendarDays } = useAppStore(s => ({
    openDetailModal: s.openDetailModal,
    representatives: s.representatives,
    allCalendarDays: s.allCalendarDaysForRelevantMonths,
  }))

  const currentPersonSummary = useMemo(() => {
    if (!summary || !personId) return null
    return summary.byPerson.find(p => p.representativeId === personId)
  }, [summary, personId])

  const currentRepresentative = useMemo(() => {
    return representatives.find(r => r.id === personId)
  }, [representatives, personId])

  const visibleMonthDate = useMemo(() => {
    return parseISO(`${summary.month}-01`)
  }, [summary.month])

  const handleMonthChange = (offset: number) => {
    const newMonth = new Date(
      visibleMonthDate.getFullYear(),
      visibleMonthDate.getMonth() + offset,
      1
    )
    openDetailModal(personId, format(newMonth, 'yyyy-MM'))
    setSelectedDate(null)
  }

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

  const monthLabel = useMemo(
    () => format(visibleMonthDate, 'MMMM yyyy', { locale: es }),
    [visibleMonthDate]
  )

  const displayedEvents = useMemo(() => {
    if (!currentPersonSummary?.incidents || !currentRepresentative) return []
    if (!selectedDate) return currentPersonSummary.incidents

    const dateKey = format(selectedDate, 'yyyy-MM-dd')

    const result = currentPersonSummary.incidents.filter(i => {
      // Para vacaciones/licencias, verificar si la fecha seleccionada está en el rango
      if (i.type === 'VACACIONES' || i.type === 'LICENCIA') {
        const resolved = resolveIncidentDates(i, allCalendarDays, currentRepresentative)
        return resolved.dates.includes(dateKey)
      }
      // Para otros, verificar fecha de inicio
      return i.startDate === dateKey
    })

    return result.sort((a, b) => a.startDate.localeCompare(b.startDate))
  }, [selectedDate, currentPersonSummary, currentRepresentative, allCalendarDays])

  const calendarDays = useMemo((): CalendarDay[] => {
    if (!currentPersonSummary || !currentRepresentative) return []

    const daysWithIncidents = new Map<string, { points: number, isOffDay: boolean, visualTypes: import('@/ui/components/CalendarGrid').DayVisualType[] }>()

    // Marcar días del mes completo con sus días OFF
    const year = parseInt(summary.month.split('-')[0])
    const month = parseInt(summary.month.split('-')[1]) - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      const isOffDay = currentRepresentative.baseSchedule[dayOfWeek] === 'OFF'
      const dateStr = format(date, 'yyyy-MM-dd')
      daysWithIncidents.set(dateStr, { points: 0, isOffDay, visualTypes: [] })
    }

    // Marcar incidencias y capas visuales
    for (const incident of currentPersonSummary.incidents) {
      if (!incident.startDate) continue

      // Para vacaciones y licencias, expandir a todos los días (banda continua)
      if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') {
        const resolved = resolveIncidentDates(incident, allCalendarDays, currentRepresentative)
        const visualType = incident.type === 'VACACIONES' ? 'VACATION' : 'LICENSE'

        for (const dateStr of resolved.dates) {
          const existing = daysWithIncidents.get(dateStr)
          if (existing) {
            const incidentPoints = calculatePoints(incident)
            existing.points += incidentPoints
            existing.visualTypes.push(visualType as any)
          }
        }
      } else {
        // Incidencias puntuales
        const existing = daysWithIncidents.get(incident.startDate)
        if (existing) {
          const incidentPoints = calculatePoints(incident)
          existing.points += incidentPoints

          // Mapear tipo de incidencia a capa visual
          if (incident.type === 'AUSENCIA') {
            existing.visualTypes.push('ABSENT' as any)
          }
          // TODO: Agregar HOLIDAY y SHIFT_CHANGE cuando estén disponibles en el dominio
        }
      }
    }

    // Resolver visual final por prioridad
    function resolveDayVisual(types: import('@/ui/components/CalendarGrid').DayVisualType[]): import('@/ui/components/CalendarGrid').DayVisualType {
      if (types.includes('ABSENT')) return 'ABSENT'
      if (types.includes('VACATION')) return 'VACATION'
      if (types.includes('LICENSE')) return 'LICENSE'
      if (types.includes('HOLIDAY')) return 'HOLIDAY'
      if (types.includes('SHIFT_CHANGE')) return 'SHIFT_CHANGE'
      return 'NORMAL'
    }

    return Array.from(daysWithIncidents.entries()).map(([dateStr, data]) => {
      let state: CalendarDay['state'] = 'normal'

      if (data.isOffDay && data.points === 0) {
        state = 'disabled'
      } else if (data.points >= 6) {
        state = 'danger'
      } else if (data.points > 0) {
        state = 'warning'
      }

      return {
        date: parseLocalDate(dateStr),
        state,
        visualType: resolveDayVisual(data.visualTypes)
      }
    })
  }, [currentPersonSummary, currentRepresentative, summary.month, allCalendarDays])

  const modalContent = (
    <PersonDetailModalContent
      allCalendarDays={allCalendarDays}
      calendarDays={calendarDays}
      currentPersonSummary={currentPersonSummary ?? null}
      currentRepresentative={currentRepresentative}
      displayedEvents={displayedEvents}
      monthLabel={monthLabel}
      onClose={onClose}
      onMonthChange={handleMonthChange}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      visibleMonthDate={visibleMonthDate}
    />
  )
  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 50,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          ref={modalRef}
          tabIndex={-1}
          style={{
            outline: 'none',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '700px',
            maxWidth: '90vw',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {modalContent}
        </motion.div>
      </div>
    </>
  )
}
