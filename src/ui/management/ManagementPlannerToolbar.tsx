'use client'

import { useRef, type ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ISODate } from '@/domain/types'

interface ManagementPlannerToolbarProps {
  title: string
  label: string
  anchorDate: ISODate
  isCurrentWeek: boolean
  trailing?: ReactNode
  onGoToday: () => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onSelectWeekDate: (date: ISODate) => void
}

export function ManagementPlannerToolbar({
  title,
  label,
  anchorDate,
  isCurrentWeek,
  trailing,
  onGoToday,
  onPrevWeek,
  onNextWeek,
  onSelectWeekDate,
}: ManagementPlannerToolbarProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const openDatePicker = () => {
    const input = dateInputRef.current

    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.click()
  }

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 18px',
        borderRadius: '20px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,242,233,0.46) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '8px',
            }}
          >
            Vista gerencial
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
        </div>
        {trailing ? <div>{trailing}</div> : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid var(--shell-border)',
            background: 'rgba(255,255,255,0.74)',
          }}
        >
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="Semana anterior"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>

          <div
            style={{
              minWidth: '180px',
              padding: '0 12px',
              textAlign: 'center',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {label}
          </div>

          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Semana siguiente"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={openDatePicker}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '14px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.74)',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <CalendarDays size={15} strokeWidth={2.2} />
            Semana
          </button>

          {!isCurrentWeek ? (
            <button
              type="button"
              onClick={onGoToday}
              style={{
                padding: '9px 12px',
                borderRadius: '14px',
                border: '1px solid var(--shell-border)',
                background: 'rgba(255,255,255,0.74)',
                color: 'var(--text-main)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Hoy
            </button>
          ) : null}
        </div>

        <input
          ref={dateInputRef}
          type="date"
          value={anchorDate}
          onChange={event => {
            if (!event.target.value) return
            onSelectWeekDate(event.target.value as ISODate)
          }}
          aria-label="Elegir semana"
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: 1,
            height: 1,
          }}
        />
      </div>
    </header>
  )
}
