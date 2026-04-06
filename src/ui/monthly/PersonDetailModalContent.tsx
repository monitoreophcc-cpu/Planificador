'use client'

import type {
  PersonMonthlySummary,
} from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { CalendarGrid, type CalendarDay } from '../components/CalendarGrid'
import { PersonDetailEventList } from './PersonDetailEventList'
import { PersonDetailModalHeader } from './PersonDetailModalHeader'
import { PersonDetailSummaryStats } from './PersonDetailSummaryStats'
import type { IncidentWithPoints } from '@/domain/analytics/types'

interface PersonDetailModalContentProps {
  allCalendarDays: DayInfo[]
  calendarDays: CalendarDay[]
  currentPersonSummary: PersonMonthlySummary | null
  currentRepresentative?: Representative
  displayedEvents: IncidentWithPoints[]
  monthLabel: string
  onClose: () => void
  onMonthChange: (offset: number) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  visibleMonthDate: Date
}

export function PersonDetailModalContent({
  allCalendarDays,
  calendarDays,
  currentPersonSummary,
  currentRepresentative,
  displayedEvents,
  monthLabel,
  onClose,
  onMonthChange,
  selectedDate,
  setSelectedDate,
  visibleMonthDate,
}: PersonDetailModalContentProps) {
  if (!currentPersonSummary || !currentRepresentative) {
    return (
      <div
        style={{
          padding: '24px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
        }}
      >
        No se encontro informacion para este representante en el mes seleccionado.
      </div>
    )
  }

  const { totals, riskLevel, name } = currentPersonSummary

  return (
    <>
      <PersonDetailModalHeader
        monthLabel={monthLabel}
        name={name}
        onClose={onClose}
        onMonthChange={onMonthChange}
      />

      <PersonDetailSummaryStats
        absences={totals.ausencias}
        errors={totals.errores}
        points={totals.puntos}
        riskLevel={riskLevel}
        tardiness={totals.tardanzas}
      />

      <div
        style={{
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
          overflow: 'hidden',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CalendarGrid
            month={visibleMonthDate}
            days={calendarDays}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        <PersonDetailEventList
          allCalendarDays={allCalendarDays}
          currentRepresentative={currentRepresentative}
          displayedEvents={displayedEvents}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Cerrar
        </button>
      </div>
    </>
  )
}
