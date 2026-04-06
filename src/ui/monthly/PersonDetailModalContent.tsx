'use client'

import type { CSSProperties } from 'react'
import type {
  IncidentWithPoints,
  PersonMonthlySummary,
  RiskLevel,
} from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { CalendarGrid, type CalendarDay } from '../components/CalendarGrid'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { parseLocalDate } from '@/domain/calendar/parseLocalDate'

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const styles: Record<RiskLevel, CSSProperties> = {
    danger: {
      backgroundColor: '#fdecea',
      color: '#b42318',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#9a6a00',
    },
    ok: {
      backgroundColor: '#e6f9ee',
      color: '#1c7c44',
    },
  }

  const labels: Record<RiskLevel, string> = {
    danger: 'RIESGO',
    warning: 'ATENCION',
    ok: 'OK',
  }

  return (
    <span
      style={{
        ...styles[level],
        padding: '6px 12px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {labels[level]}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #f3f4f6',
        borderRadius: '8px',
        padding: '8px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '2px',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
        {value}
      </div>
    </div>
  )
}

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
      <header
        style={{
          paddingBottom: '12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            {name}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              onClick={() => onMonthChange(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <p
              style={{
                margin: 0,
                color: '#374151',
                fontWeight: 600,
                textTransform: 'capitalize',
                width: '140px',
                textAlign: 'center',
              }}
            >
              {monthLabel}
            </p>
            <button
              onClick={() => onMonthChange(1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          <X size={24} />
        </button>
      </header>

      <div
        style={{
          margin: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <Stat label="Ausencias" value={totals.ausencias} />
          <Stat label="Tardanzas" value={totals.tardanzas} />
          <Stat label="Errores" value={totals.errores} />
          <Stat label="Puntos" value={totals.puntos} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '2px',
              fontWeight: 500,
            }}
          >
            Estado General
          </div>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

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

                      let dateLabel = ''
                      let workingDaysInfo = ''

                      if (
                        incident.type === 'VACACIONES' ||
                        incident.type === 'LICENCIA'
                      ) {
                        const resolved = resolveIncidentDates(
                          incident,
                          allCalendarDays,
                          currentRepresentative
                        )

                        if (resolved.start && resolved.end && resolved.returnDate) {
                          const startFormatted = format(
                            parseLocalDate(resolved.start),
                            "dd 'de' MMMM",
                            { locale: es }
                          )
                          const endFormatted = format(
                            parseLocalDate(resolved.end),
                            "dd 'de' MMMM",
                            { locale: es }
                          )
                          const returnFormatted = format(
                            parseLocalDate(resolved.returnDate),
                            "dd 'de' MMMM",
                            { locale: es }
                          )

                          dateLabel = `${
                            incident.type === 'VACACIONES'
                              ? 'Vacaciones'
                              : 'Licencia'
                          } del ${startFormatted} al ${endFormatted}`
                          workingDaysInfo =
                            incident.type === 'VACACIONES'
                              ? `${resolved.dates.length} dias laborables • Retorna ${returnFormatted}`
                              : `${resolved.dates.length} dias naturales • Retorna ${returnFormatted}`
                        }
                      } else {
                        dateLabel = incident.startDate
                          ? format(
                              parseLocalDate(incident.startDate),
                              "EEEE, dd 'de' MMMM",
                              { locale: es }
                            )
                          : 'Fecha no disponible'
                      }

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
                                {dateLabel}
                              </span>
                            </div>

                            {workingDaysInfo && (
                              <p
                                style={{
                                  fontSize: '12px',
                                  color: '#059669',
                                  margin: 0,
                                  paddingLeft: '8px',
                                  fontWeight: 500,
                                }}
                              >
                                {workingDaysInfo}
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
