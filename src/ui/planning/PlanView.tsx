'use client'

import React, { Dispatch, SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type {
  WeeklyPlan,
  Representative,
  DayInfo,
  ShiftType,
  ISODate,
} from '../../domain/types'
import { VariableSizeList as List } from 'react-window'
import { PlanRow } from './PlanRow'
import { PlannerAssignmentsMap } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { ROW_HEIGHT, PLANNER_WIDTHS } from './constants'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { format } from 'date-fns'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'
import { getCoverageTone } from './planningOperationalMetrics'
import { UI_GLOSSARY } from '@/ui/copy/glossary'

interface PlanViewProps {
  weeklyPlan: WeeklyPlan
  weekDays: DayInfo[]
  agents: Representative[]
  activeShift: ShiftType
  assignmentsMap: PlannerAssignmentsMap
  coverageData: Record<ISODate, EffectiveCoverageResult>
  isCurrentWeek: boolean
  weekLabel: string
  onCellClick: (repId: string, date: ISODate) => Promise<void>
  onCellContextMenu: (repId: string, date: ISODate, e: React.MouseEvent) => void
  onEditDay: Dispatch<SetStateAction<DayInfo | null>>
  onGoToday: () => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

function Row({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    agents: Representative[]
    weeklyPlan: WeeklyPlan
    weekDays: DayInfo[]
    activeShift: ShiftType
    assignmentsMap: PlannerAssignmentsMap
    onCellClick: (repId: string, date: ISODate) => Promise<void>
    onCellContextMenu: (repId: string, date: ISODate, e: React.MouseEvent) => void
  }
}) {
  const { agents, weeklyPlan, weekDays, activeShift, assignmentsMap, onCellClick, onCellContextMenu } = data
  const agent = agents[index]

  if (!agent) return null


  return (
    <div style={style}>
      <PlanRow
        agent={agent}
        weeklyPlan={weeklyPlan}
        weekDays={weekDays}
        activeShift={activeShift}
        assignmentsMap={assignmentsMap}
        isAlternate={index % 2 !== 0} // Zebra by row (agent)
        onCellClick={onCellClick}
        onCellContextMenu={onCellContextMenu}
      />
    </div>
  )
}

export function PlanView({
  weeklyPlan,
  weekDays,
  agents,
  activeShift,
  assignmentsMap,
  coverageData,
  isCurrentWeek,
  weekLabel,
  onCellClick,
  onCellContextMenu,
  onEditDay,
  onGoToday,
  onPrevWeek,
  onNextWeek,
}: PlanViewProps) {
  const itemData = React.useMemo(
    () => ({
      agents,
      weeklyPlan,
      weekDays,
      activeShift,
      assignmentsMap,
      onCellClick,
      onCellContextMenu,
    }),
    [agents, weeklyPlan, weekDays, activeShift, assignmentsMap, onCellClick, onCellContextMenu]
  )
  const todayIso = format(new Date(), 'yyyy-MM-dd') as ISODate
  const tableBodyHeight =
    typeof window !== 'undefined'
      ? Math.max(340, Math.min(600, window.innerHeight - 400))
      : 400

  const coverageColor = (date: ISODate) => {
    const tone = getCoverageTone(coverageData[date])

    if (tone === 'success') return PLANNER_THEME.success
    if (tone === 'warning') return PLANNER_THEME.warning
    if (tone === 'danger') return PLANNER_THEME.danger
    return PLANNER_THEME.textFaint
  }

  return (
    <div
      style={{
        width: '100%',
        background: PLANNER_THEME.surfaceRaised,
        borderRadius: '20px',
        border: `1px solid ${PLANNER_THEME.borderStrong}`,
        boxShadow: '0 24px 48px rgba(10, 8, 6, 0.26)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 18px',
          background: PLANNER_THEME.shellSurfacePaper,
          borderBottom: `1px solid ${PLANNER_THEME.shellBorderSoftAccent}`,
          boxShadow: 'inset 0 -1px 0 rgba(var(--accent-rgb), 0.08)',
          flexWrap: 'wrap',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={weekLabel}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              color: PLANNER_THEME.shellText,
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.01em',
            }}
          >
            {weekLabel}
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {!isCurrentWeek && (
            <button
              onClick={onGoToday}
              style={{
                border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
                background: PLANNER_THEME.controlBg,
                color: PLANNER_THEME.controlTextMuted,
                borderRadius: '999px',
                padding: '7px 12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.84rem',
              }}
            >
              Hoy
            </button>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: `1px solid ${PLANNER_THEME.controlBorder}`,
              borderRadius: '999px',
              padding: '4px',
              background: PLANNER_THEME.controlBg,
            }}
          >
            <button
              onClick={onPrevWeek}
              style={{
                border: 'none',
                background: 'transparent',
                color: PLANNER_THEME.controlText,
                cursor: 'pointer',
                padding: '6px 9px',
                borderRadius: '999px',
              }}
            >
              &lt;
            </button>
            <span
              style={{
                color: PLANNER_THEME.controlTextMuted,
                fontSize: '0.86rem',
                minWidth: '158px',
                textAlign: 'center',
              }}
            >
              {activeShift === 'DAY' ? 'Turno Día' : 'Turno Noche'}
            </span>
            <button
              onClick={onNextWeek}
              style={{
                border: 'none',
                background: 'transparent',
                color: PLANNER_THEME.controlText,
                cursor: 'pointer',
                padding: '6px 9px',
                borderRadius: '999px',
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${PLANNER_WIDTHS.AGENT_NAME}px repeat(7, 1fr)`,
          borderBottom: `1px solid ${PLANNER_THEME.border}`,
          padding: '12px 0 10px',
          fontWeight: 600,
          background: PLANNER_THEME.surfacePanelSoft,
          color: 'var(--color-text-secondary)',
        }}
      >
        <div
          style={{
            paddingLeft: '18px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
          }}
        >
          {UI_GLOSSARY.representative.singular}
        </div>
        {weekDays.map(day => {
          const isToday = day.date === todayIso

          return (
            <div
              key={day.date}
              style={{
                padding: '0 6px',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: isToday ? PLANNER_THEME.info : 'var(--color-text-secondary)',
                  position: 'relative',
                  padding: '8px 6px 10px',
                  borderRadius: '16px',
                  minHeight: '62px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  background: isToday ? 'rgba(47, 128, 237, 0.12)' : 'transparent',
                  border: `1px solid ${isToday ? 'rgba(47, 128, 237, 0.28)' : 'transparent'}`,
                  boxShadow: isToday ? 'inset 0 1px 0 rgba(255, 255, 255, 0.4)' : 'none',
                  transition: 'background 140ms ease, border-color 140ms ease, color 140ms ease',
                }}
                title={day.label}
                onClick={() => onEditDay(day)}
              >
                <div
                  style={{
                    fontSize: '14px',
                    letterSpacing: '0.01em',
                    fontWeight: isToday ? 700 : 600,
                  }}
                >
                  {new Date(day.date + 'T12:00:00Z')
                    .toLocaleDateString('es-ES', { weekday: 'short' })
                    .replace('.', '')}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.1,
                    fontWeight: isToday ? 700 : 600,
                    color: isToday ? PLANNER_THEME.info : 'var(--color-text-secondary)',
                    opacity: isToday ? 1 : 0.82,
                  }}
                >
                  {day.date.split('-')[2]}
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    width: '24px',
                    height: '2px',
                    borderRadius: '999px',
                    backgroundColor: isToday ? PLANNER_THEME.info : 'transparent',
                    opacity: isToday ? 1 : 0,
                    marginTop: '2px',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          height: `${tableBodyHeight}px`,
          width: '100%',
          overflow: 'auto',
          background: PLANNER_THEME.surfaceInset,
        }}
      >
        <List
          height={tableBodyHeight}
          itemCount={agents.length}
          itemSize={() => ROW_HEIGHT}
          width={'100%'}
          itemData={itemData}
        >
          {Row}
        </List>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${PLANNER_WIDTHS.AGENT_NAME}px repeat(7, 1fr)`,
          alignItems: 'center',
          minHeight: '44px',
          background: PLANNER_THEME.surfacePanel,
          borderTop: `1px solid ${PLANNER_THEME.borderStrong}`,
        }}
      >
        <div
          style={{
            paddingLeft: '18px',
            color: PLANNER_THEME.textMuted,
            fontSize: '0.88rem',
          }}
        >
          Cobertura
        </div>
        {weekDays.map(day => {
          const coverage = coverageData[day.date]

          return (
            <div
              key={day.date}
              title={
                coverage
                  ? `${coverage.actual} en turno · mínimo ${coverage.required}`
                  : 'Sin cobertura'
              }
              style={{
                textAlign: 'center',
                color: coverage ? coverageColor(day.date) : PLANNER_THEME.textFaint,
                fontWeight: 700,
                fontSize: '0.98rem',
              }}
            >
              {coverage?.actual ?? '—'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
