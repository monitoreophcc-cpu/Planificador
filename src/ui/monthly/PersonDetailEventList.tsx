'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import type { IncidentWithPoints } from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { PersonDetailEventItem } from './PersonDetailEventItem'
import { getPersonDetailEventEmptyMessage } from './personDetailEventListHelpers'

interface PersonDetailEventListProps {
  allCalendarDays: DayInfo[]
  currentRepresentative: Representative
  displayedEvents: IncidentWithPoints[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
}

export function PersonDetailEventList({
  allCalendarDays,
  currentRepresentative,
  displayedEvents,
  selectedDate,
  setSelectedDate,
}: PersonDetailEventListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          margin: 0,
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          Eventos
          {selectedDate
            ? ` para ${format(selectedDate, 'd MMM', { locale: es })}`
            : ' del Mes'}
        </span>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            style={{
              fontSize: 12,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontWeight: 500,
            }}
          >
            Mostrar todo el mes
          </button>
        )}
      </h3>

      <div
        style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          paddingRight: '8px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate?.toISOString() || 'month-view'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {displayedEvents.length === 0 ? (
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '20px 0',
                }}
              >
                {getPersonDetailEventEmptyMessage(selectedDate)}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {displayedEvents.map(incident => (
                  <PersonDetailEventItem
                    key={incident.id}
                    allCalendarDays={allCalendarDays}
                    currentRepresentative={currentRepresentative}
                    incident={incident}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
