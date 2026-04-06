'use client'

import React, { useRef, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, isToday, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarGrid } from '../components/CalendarGrid'

export type DailyLogFilterMode = 'TODAY' | 'WEEK' | 'MONTH'

type DailyLogToolbarProps = {
  date: Date
  onDateChange: (date: Date) => void
  filterMode: DailyLogFilterMode
  onFilterModeChange: (mode: DailyLogFilterMode) => void
}

export function DailyLogToolbar({
  date,
  onDateChange,
  filterMode,
  onFilterModeChange,
}: DailyLogToolbarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-md) var(--space-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '74px',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            margin: '0 0 var(--space-xl) 0',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-md)',
            color: 'var(--text-main)',
          }}
        >
          Registro de Eventos
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
          }}
          ref={calendarRef}
        >
          <button
            onClick={() => onDateChange(subDays(date, 1))}
            style={{
              padding: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-panel)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
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
            style={{
              padding: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-panel)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setIsCalendarOpen(previous => !previous)}
            style={{
              padding: '8px',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-panel)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <CalendarIcon size={16} />
          </button>

          {!isToday(date) && (
            <button
              onClick={() => onDateChange(new Date())}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-strong)',
                borderRadius: '6px',
                background: 'var(--bg-panel)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
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
                marginTop: '8px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
        <button
          onClick={() => onFilterModeChange('TODAY')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            background: filterMode === 'TODAY' ? '#111827' : 'white',
            color: filterMode === 'TODAY' ? 'white' : '#374151',
            borderColor: filterMode === 'TODAY' ? '#111827' : '#d1d5db',
          }}
        >
          Hoy
        </button>
        <button
          onClick={() => onFilterModeChange('WEEK')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            background: filterMode === 'WEEK' ? '#111827' : 'white',
            color: filterMode === 'WEEK' ? 'white' : '#374151',
            borderColor: filterMode === 'WEEK' ? '#111827' : '#d1d5db',
          }}
        >
          Esta Semana
        </button>
        <button
          onClick={() => onFilterModeChange('MONTH')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            background: filterMode === 'MONTH' ? '#111827' : 'white',
            color: filterMode === 'MONTH' ? 'white' : '#374151',
            borderColor: filterMode === 'MONTH' ? '#111827' : '#d1d5db',
          }}
        >
          Mes Actual
        </button>
      </div>
    </>
  )
}
