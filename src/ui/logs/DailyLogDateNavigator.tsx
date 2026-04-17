'use client'

import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { addDays, addMonths, format, subDays, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarGrid } from '../components/CalendarGrid'
import { getDailyLogControlButtonStyle } from './dailyLogToolbarStyles'

type DailyLogDateNavigatorProps = {
  date: Date
  onDateChange: (date: Date) => void
}

export function DailyLogDateNavigator({
  date,
  onDateChange,
}: DailyLogDateNavigatorProps) {
  const formatWithLeadingCapital = (value: Date, pattern: string) => {
    const formatted = format(value, pattern, { locale: es })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(date)

  const handleToggleCalendar = () => {
    setDisplayMonth(date)
    setIsCalendarOpen(previous => !previous)
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
        justifyContent: 'flex-end',
        minWidth: 0,
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid rgba(137, 149, 161, 0.2)',
        background: 'rgba(255, 255, 255, 0.78)',
        boxShadow: '0 8px 16px rgba(24, 34, 48, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onDateChange(subMonths(date, 1))}
          style={getDailyLogControlButtonStyle()}
          title="Ir al mes anterior"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onDateChange(subDays(date, 1))}
          style={getDailyLogControlButtonStyle()}
          title="Ir al día anterior"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-main)',
          minWidth: '190px',
          textAlign: 'center',
          padding: '0 8px',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {formatWithLeadingCapital(date, "EEEE, d 'de' MMMM")}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onDateChange(addDays(date, 1))}
          style={getDailyLogControlButtonStyle()}
          title="Ir al día siguiente"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={handleToggleCalendar}
          style={getDailyLogControlButtonStyle()}
          title="Abrir calendario"
        >
          <CalendarIcon size={18} />
        </button>

        <button
          onClick={() => onDateChange(addMonths(date, 1))}
          style={getDailyLogControlButtonStyle()}
          title="Ir al mes siguiente"
        >
          <ChevronsRight size={18} />
        </button>
      </div>

      {isCalendarOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
            border: '1px solid var(--shell-border)',
            borderRadius: '20px',
            padding: 'var(--space-md)',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)',
            minWidth: '320px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setDisplayMonth(previous => subMonths(previous, 1))}
              style={getDailyLogControlButtonStyle()}
              title="Ver mes anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: '-0.01em',
              }}
            >
              {formatWithLeadingCapital(displayMonth, "MMMM 'de' yyyy")}
            </div>

            <button
              type="button"
              onClick={() => setDisplayMonth(previous => addMonths(previous, 1))}
              style={getDailyLogControlButtonStyle()}
              title="Ver mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <CalendarGrid
            month={displayMonth}
            selected={date}
            onSelect={selectedDate => {
              onDateChange(selectedDate)
              setIsCalendarOpen(false)
            }}
            days={[]}
          />
        </div>
      )}
    </div>
  )
}
