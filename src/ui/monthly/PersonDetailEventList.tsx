'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import type { IncidentWithPoints } from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'

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
                {selectedDate
                  ? 'No se registraron incidencias en este dia.'
                  : 'No se registraron incidencias con penalizacion este mes.'}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {displayedEvents.map(incident => {
                  const styleInfo =
                    INCIDENT_STYLES[incident.type] ?? INCIDENT_STYLES.OTRO
                  const eventDisplay = buildIncidentDisplay(
                    incident,
                    allCalendarDays,
                    currentRepresentative
                  )
                  const points = calculatePoints(incident)

                  return (
                    <li
                      key={incident.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        padding: '12px 4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 500,
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor:
                                styleInfo.variant === 'danger'
                                  ? 'hsl(0, 100%, 97%)'
                                  : styleInfo.variant === 'warning'
                                    ? 'hsl(45, 100%, 96%)'
                                    : 'hsl(220, 15%, 96%)',
                              color:
                                styleInfo.variant === 'danger'
                                  ? 'hsl(0, 70%, 45%)'
                                  : styleInfo.variant === 'warning'
                                    ? 'hsl(45, 70%, 35%)'
                                    : 'hsl(220, 10%, 40%)',
                            }}
                          >
                            {styleInfo.label}
                          </span>
                          <span style={{ color: '#6b7280' }}>
                            {eventDisplay.dateLabel}
                          </span>
                        </div>

                        {eventDisplay.workingDaysInfo && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: '#059669',
                              margin: 0,
                              paddingLeft: '8px',
                              fontWeight: 500,
                            }}
                          >
                            {eventDisplay.workingDaysInfo}
                          </p>
                        )}

                        {incident.note && (
                          <p
                            style={{
                              fontSize: '14px',
                              color: '#374151',
                              marginTop: '4px',
                              paddingLeft: '8px',
                              borderLeft: '3px solid var(--border-subtle)',
                            }}
                          >
                            {incident.note}
                          </p>
                        )}
                      </div>

                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '16px',
                          color: points > 0 ? '#b91c1c' : '#374151',
                        }}
                      >
                        {points > 0 ? `-${points}` : points}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function buildIncidentDisplay(
  incident: IncidentWithPoints,
  allCalendarDays: DayInfo[],
  currentRepresentative: Representative
) {
  if (incident.type === 'VACACIONES' || incident.type === 'LICENCIA') {
    const resolved = resolveIncidentDates(
      incident,
      allCalendarDays,
      currentRepresentative
    )

    if (resolved.start && resolved.end && resolved.returnDate) {
      const startFormatted = format(parseLocalDate(resolved.start), "dd 'de' MMMM", {
        locale: es,
      })
      const endFormatted = format(parseLocalDate(resolved.end), "dd 'de' MMMM", {
        locale: es,
      })
      const returnFormatted = format(
        parseLocalDate(resolved.returnDate),
        "dd 'de' MMMM",
        { locale: es }
      )

      return {
        dateLabel: `${
          incident.type === 'VACACIONES' ? 'Vacaciones' : 'Licencia'
        } del ${startFormatted} al ${endFormatted}`,
        workingDaysInfo:
          incident.type === 'VACACIONES'
            ? `${resolved.dates.length} dias laborables • Retorna ${returnFormatted}`
            : `${resolved.dates.length} dias naturales • Retorna ${returnFormatted}`,
      }
    }
  }

  return {
    dateLabel: incident.startDate
      ? format(parseLocalDate(incident.startDate), "EEEE, dd 'de' MMMM", {
          locale: es,
        })
      : 'Fecha no disponible',
    workingDaysInfo: '',
  }
}
