'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, isToday, subDays } from 'date-fns'
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        position: 'relative',
      }}
    >
      <button
        onClick={() => onDateChange(subDays(date, 1))}
        style={getDailyLogControlButtonStyle()}
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
        }}
      >
        {format(date, "EEEE, dd 'de' MMMM", { locale: es })}
      </div>

      <button
        onClick={() => onDateChange(addDays(date, 1))}
        style={getDailyLogControlButtonStyle()}
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => setIsCalendarOpen(previous => !previous)}
        style={getDailyLogControlButtonStyle()}
      >
        <CalendarIcon size={16} />
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <CalendarGrid
            month={date}
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
