'use client'

import * as Popover from '@radix-ui/react-popover'
import { CalendarDays, ChevronLeft, ChevronRight, Info, PencilLine } from 'lucide-react'
import { useRef } from 'react'
import type { ISODate, ShiftType } from '@/domain/types'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'

export type PlanningSectionViewMode = 'OPERATIONAL' | 'MANAGERIAL'

interface PlanningSectionViewTabsProps {
  activeShift: ShiftType
  canEditData?: boolean
  isCurrentWeek: boolean
  planningAnchorDate: ISODate
  viewMode: PlanningSectionViewMode
  weekControlLabel: string
  onGoToday: () => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onSelectWeekDate: (date: ISODate) => void
  onSelectDay: () => void
  onSelectNight: () => void
  onSelectManagerial: () => void
  onOpenSwapManager: () => void
}

function shiftTabStyle(isActive: boolean) {
  return {
    padding: '8px 14px',
    cursor: 'pointer',
    border: '1px solid transparent',
    color: isActive ? PLANNER_THEME.controlText : PLANNER_THEME.controlTextMuted,
    fontWeight: isActive ? 700 : 600,
    background: isActive ? PLANNER_THEME.controlBgActive : 'transparent',
    fontSize: '13px',
    borderRadius: '12px',
    boxShadow: 'none',
    whiteSpace: 'nowrap',
  } as const
}

function secondaryControlStyle() {
  return {
    padding: '8px 12px',
    background: PLANNER_THEME.controlBg,
    color: PLANNER_THEME.controlTextMuted,
    border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  } as const
}

export function PlanningSectionViewTabs({
  activeShift,
  canEditData = true,
  isCurrentWeek,
  planningAnchorDate,
  viewMode,
  weekControlLabel,
  onGoToday,
  onPrevWeek,
  onNextWeek,
  onSelectWeekDate,
  onSelectDay,
  onSelectNight,
  onSelectManagerial,
  onOpenSwapManager,
}: PlanningSectionViewTabsProps) {
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
    <section
      style={{
        border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
        borderRadius: '22px',
        background: PLANNER_THEME.shellSurfacePaper,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px 16px',
        boxShadow: PLANNER_THEME.shellShadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h2
          style={{
            margin: 0,
            color: PLANNER_THEME.shellText,
            fontSize: '1.15rem',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            fontWeight: 800,
          }}
        >
          Armado y ajuste de semanas
        </h2>
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
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            flex: '1 1 720px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '14px',
              border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
              background: PLANNER_THEME.controlBg,
            }}
          >
            <button
              type="button"
              onClick={onPrevWeek}
              aria-label="Semana anterior"
              style={{
                ...secondaryControlStyle(),
                padding: '8px',
                border: 'none',
                background: 'transparent',
                color: PLANNER_THEME.controlText,
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <div
              style={{
                minWidth: '170px',
                padding: '0 10px',
                textAlign: 'center',
                color: PLANNER_THEME.controlText,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              {weekControlLabel}
            </div>
            <button
              type="button"
              onClick={onNextWeek}
              aria-label="Semana siguiente"
              style={{
                ...secondaryControlStyle(),
                padding: '8px',
                border: 'none',
                background: 'transparent',
                color: PLANNER_THEME.controlText,
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          <button type="button" onClick={openDatePicker} style={secondaryControlStyle()}>
            <CalendarDays size={16} strokeWidth={2.2} />
            Semana
          </button>

          {!isCurrentWeek ? (
            <button type="button" onClick={onGoToday} style={secondaryControlStyle()}>
              Hoy
            </button>
          ) : null}

          <input
            ref={dateInputRef}
            type="date"
            value={planningAnchorDate}
            onChange={event => {
              if (event.target.value) {
                onSelectWeekDate(event.target.value as ISODate)
              }
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

          <div
            aria-hidden="true"
            style={{
              width: '1px',
              height: '26px',
              background: 'rgba(var(--accent-rgb), 0.14)',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '14px',
              border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
              background: PLANNER_THEME.controlBg,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              style={shiftTabStyle(
                activeShift === 'DAY' && viewMode === 'OPERATIONAL'
              )}
              onClick={onSelectDay}
            >
              Turno Día
            </button>
            <button
              type="button"
              style={shiftTabStyle(
                activeShift === 'NIGHT' && viewMode === 'OPERATIONAL'
              )}
              onClick={onSelectNight}
            >
              Turno Noche
            </button>
            <button
              type="button"
              style={shiftTabStyle(viewMode === 'MANAGERIAL')}
              onClick={onSelectManagerial}
            >
              Gerencial
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginLeft: 'auto',
          }}
        >
          <Popover.Root>
            <Popover.Trigger asChild>
              <button type="button" style={secondaryControlStyle()}>
                <Info size={15} strokeWidth={2.2} />
                Resumen
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="app-shell-view-popover"
                align="end"
                sideOffset={10}
              >
                <p className="app-shell-view-popover__eyebrow">Planificación</p>
                <p className="app-shell-view-popover__title">
                  Armado y ajuste de semanas
                </p>
                <p className="app-shell-view-popover__description">
                  Calendario, reglas y escenarios para preparar el equipo antes de
                  que el día empiece.
                </p>
                <div className="app-shell-view-popover__context">
                  La semana seleccionada controla KPIs, filtros y tabla.
                </div>
                <Popover.Arrow className="app-shell-view-popover__arrow" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {viewMode === 'OPERATIONAL' ? (
            <button
              type="button"
              onClick={canEditData ? onOpenSwapManager : undefined}
              disabled={!canEditData}
              aria-disabled={!canEditData}
              style={{
                padding: '10px 14px',
                background:
                  canEditData
                    ? 'linear-gradient(135deg, var(--accent-strong) 0%, var(--accent) 100%)'
                    : PLANNER_THEME.controlBg,
                color: canEditData ? '#fff' : PLANNER_THEME.controlTextMuted,
                border: `1px solid ${
                  canEditData
                    ? 'rgba(var(--accent-rgb), 0.2)'
                    : PLANNER_THEME.controlBorderStrong
                }`,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: canEditData ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: canEditData ? '0 10px 20px rgba(var(--accent-rgb), 0.18)' : 'none',
                opacity: canEditData ? 1 : 0.66,
              }}
            >
              <PencilLine size={16} strokeWidth={2.2} />
              Gestionar cambios
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
