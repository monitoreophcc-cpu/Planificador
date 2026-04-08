'use client'

import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { addDays, addMonths, format, isToday, subDays, subMonths } from 'date-fns'
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(date)

  const handleToggleCalendar = () => {
    setDisplayMonth(date)
    setIsCalendarOpen(previous => !previous)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        position: 'relative',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}
    >
      <button
        onClick={() => onDateChange(subMonths(date, 1))}
        style={getDailyLogControlButtonStyle()}
        title="Ir al mes anterior"
      >
        <ChevronsLeft size={16} />
      </button>

      <button
        onClick={() => onDateChange(subDays(date, 1))}
        style={getDailyLogControlButtonStyle()}
        title="Ir al día anterior"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text-main)',
          minWidth: '220px',
          textAlign: 'center',
          padding: '0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        {format(date, "EEEE, dd 'de' MMMM", { locale: es })}
      </div>

      <button
        onClick={() => onDateChange(addDays(date, 1))}
        style={getDailyLogControlButtonStyle()}
        title="Ir al día siguiente"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={handleToggleCalendar}
        style={getDailyLogControlButtonStyle()}
        title="Abrir calendario"
      >
        <CalendarIcon size={16} />
      </button>

      <button
        onClick={() => onDateChange(addMonths(date, 1))}
        style={getDailyLogControlButtonStyle()}
        title="Ir al mes siguiente"
      >
        <ChevronsRight size={16} />
      </button>

      {!isToday(date) && (
        <button
          onClick={() => onDateChange(new Date())}
          style={{
            ...getDailyLogControlButtonStyle(),
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Hoy
        </button>
      )}

      {isCalendarOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--space-sm)',
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
                textTransform: 'capitalize',
                letterSpacing: '-0.01em',
              }}
            >
              {format(displayMonth, "MMMM 'de' yyyy", { locale: es })}
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
