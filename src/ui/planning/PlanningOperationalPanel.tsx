'use client'

import React, {
  useDeferredValue,
  useMemo,
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'
import type {
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
  WeeklyPlan,
} from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import type { PlannerAssignmentsMap } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { PLANNER_THEME } from '@/ui/theme/plannerTheme'
import { PlanView } from './PlanView'
import { PlanningCoverageChart } from './PlanningCoverageChart'
import { getPlannerOperationalMetrics } from './planningOperationalMetrics'
import { UI_GLOSSARY } from '@/ui/copy/glossary'

interface PlanningOperationalPanelProps {
  activeShift: ShiftType
  assignmentsMap: PlannerAssignmentsMap
  coverageData: Record<ISODate, EffectiveCoverageResult>
  agents: Representative[]
  incidents: Incident[]
  isCurrentWeek: boolean
  isReadOnly?: boolean
  representatives: Representative[]
  weekDays: DayInfo[]
  weekLabel: string
  weeklyPlan: WeeklyPlan | null
  onCellClick: (repId: string, date: ISODate) => Promise<void>
  onCellContextMenu: (
    repId: string,
    date: ISODate,
    event: MouseEvent
  ) => void
  onEditDay: Dispatch<SetStateAction<DayInfo | null>>
  onNavigateToSettings: () => void
}

type PlannerQuickFilter = 'ALL' | 'ABSENCE_WEEK' | 'OFF_TODAY' | 'ACTIVE_TODAY'

export function PlanningOperationalPanel({
  activeShift,
  assignmentsMap,
  coverageData,
  agents,
  incidents,
  isCurrentWeek,
  isReadOnly = false,
  representatives,
  weekDays,
  weekLabel,
  weeklyPlan,
  onCellClick,
  onCellContextMenu,
  onEditDay,
  onNavigateToSettings,
}: PlanningOperationalPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<PlannerQuickFilter>('ALL')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const metrics = getPlannerOperationalMetrics({
    activeShift,
    assignmentsMap,
    coverageData,
    incidents,
    isCurrentWeek,
    representatives,
    weekDays,
  })

  const kpiToneColor = {
    success: PLANNER_THEME.shellAccent,
    warning: PLANNER_THEME.shellWarm,
    danger: PLANNER_THEME.shellDanger,
    neutral: PLANNER_THEME.shellTextMuted,
  }[metrics.weeklyStatusTone]
  const filterDate = metrics.focusDate

  const filteredAgents = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase()

    return agents.filter(agent => {
      if (normalizedSearch && !agent.name.toLowerCase().includes(normalizedSearch)) {
        return false
      }

      if (quickFilter === 'ALL') {
        return true
      }

      if (quickFilter === 'ABSENCE_WEEK') {
        return weekDays.some(day => {
          const duty = assignmentsMap[agent.id]?.[day.date]?.[activeShift]
          return duty?.reason === 'AUSENCIA'
        })
      }

      if (!filterDate) {
        return true
      }

      const focusDuty = assignmentsMap[agent.id]?.[filterDate]?.[activeShift]

      if (!focusDuty) {
        return false
      }

      if (quickFilter === 'OFF_TODAY') {
        return (
          focusDuty.shouldWork === false &&
          !focusDuty.reason
        )
      }

      if (quickFilter === 'ACTIVE_TODAY') {
        return focusDuty.shouldWork === true
      }

      return true
    })
  }, [
    activeShift,
    agents,
    assignmentsMap,
    deferredSearchQuery,
    filterDate,
    quickFilter,
    weekDays,
  ])

  const filterLabelMap: Record<PlannerQuickFilter, string> = {
    ALL: 'Todos',
    ABSENCE_WEEK: 'Con AUS esta semana',
    OFF_TODAY: 'OFF hoy',
    ACTIVE_TODAY: 'Activos hoy',
  }
  const shiftContextLabel = activeShift === 'DAY' ? 'Turno Día' : 'Turno Noche'

  return (
    <>
        {weeklyPlan ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '2px 4px 0',
                color: PLANNER_THEME.shellTextMuted,
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              <span>{weekLabel}</span>
              <span aria-hidden="true" style={{ opacity: 0.5 }}>
                ·
              </span>
              <span>{shiftContextLabel}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                {
                  key: 'week',
                  title: 'SEMANA ACTUAL',
                  value: metrics.weeklyStatusLabel,
                  caption: metrics.weeklyStatusDetail,
                  tone: kpiToneColor,
                },
                {
                  key: 'current',
                  title: metrics.focusCoverageTitle,
                  value: `${metrics.focusCoverageActual}`,
                  caption: metrics.focusCoverageCaption,
                  tone:
                    metrics.focusCoverageRequired === 0
                      ? PLANNER_THEME.shellText
                      : metrics.focusCoverageActual < metrics.focusCoverageRequired
                        ? PLANNER_THEME.shellDanger
                        : metrics.focusCoverageActual === metrics.focusCoverageRequired
                          ? PLANNER_THEME.shellWarm
                          : PLANNER_THEME.shellAccent,
                },
                {
                  key: 'absences',
                  title: 'AUSENCIAS ESTA SEMANA',
                  value: `${metrics.weeklyAbsences}`,
                  caption: `${metrics.weeklyAbsences} AUS · ${metrics.justifiedAbsences} justificadas`,
                  tone:
                    metrics.unjustifiedAbsences > 0
                      ? PLANNER_THEME.shellDanger
                      : metrics.weeklyAbsences > 0
                        ? PLANNER_THEME.shellWarm
                        : PLANNER_THEME.shellText,
                },
                {
                  key: 'availability',
                  title: metrics.focusAvailabilityTitle,
                  value: `${metrics.availableAgents}`,
                  caption: metrics.availabilityCaption,
                  tone:
                    metrics.unavailableAgents > 0
                      ? PLANNER_THEME.shellWarm
                      : PLANNER_THEME.shellAccent,
                },
              ].map(card => (
                <section
                  key={card.key}
                  style={{
                    background:
                      card.key === 'week'
                        ? PLANNER_THEME.shellSurfaceTinted
                        : card.key === 'absences'
                          ? PLANNER_THEME.shellSurfaceWarm
                          : PLANNER_THEME.shellSurface,
                    borderRadius: '16px',
                    border: `1px solid ${
                      card.key === 'absences'
                        ? PLANNER_THEME.shellBorderWarm
                        : PLANNER_THEME.shellBorder
                    }`,
                    padding: '14px 16px',
                    minHeight: '98px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: PLANNER_THEME.shellShadow,
                  }}
                >
                  <div
                    style={{
                      color: PLANNER_THEME.shellTextMuted,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      color: card.tone,
                      fontSize: card.key === 'week' ? '1.48rem' : '1.72rem',
                      lineHeight: 1,
                      fontWeight: 700,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      color: PLANNER_THEME.shellTextMuted,
                      fontSize: '0.8rem',
                      lineHeight: 1.35,
                      marginTop: 'auto',
                    }}
                  >
                    {card.caption}
                    {card.key === 'absences' && metrics.unjustifiedAbsences > 0
                      ? ` · ${metrics.unjustifiedAbsences} no justificadas`
                      : ''}
                  </div>
                </section>
              ))}
            </div>

            <section
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '12px 14px',
                background: PLANNER_THEME.shellSurfaceTinted,
                borderRadius: '16px',
                border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
                boxShadow: PLANNER_THEME.shellShadow,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  flex: '1 1 480px',
                }}
              >
                <input
                  className="planner-search-input"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder={`Buscar ${UI_GLOSSARY.representative.singular.toLowerCase()}`}
                  aria-label={`Buscar ${UI_GLOSSARY.representative.singular.toLowerCase()}`}
                  style={{
                    minWidth: '220px',
                    flex: '1 1 260px',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
                    background: PLANNER_THEME.controlBg,
                    color: PLANNER_THEME.controlText,
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  {(['ALL', 'ABSENCE_WEEK', 'OFF_TODAY', 'ACTIVE_TODAY'] as PlannerQuickFilter[]).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setQuickFilter(filter)}
                      style={{
                        border: `1px solid ${
                          quickFilter === filter
                            ? PLANNER_THEME.controlBorderStrong
                            : PLANNER_THEME.controlBorder
                        }`,
                        background:
                          quickFilter === filter
                            ? PLANNER_THEME.controlBgActive
                            : PLANNER_THEME.controlBg,
                        color:
                          quickFilter === filter
                            ? PLANNER_THEME.controlText
                            : PLANNER_THEME.controlTextMuted,
                        borderRadius: '999px',
                        padding: '7px 10px',
                        cursor: 'pointer',
                        fontWeight: quickFilter === filter ? 700 : 500,
                        fontSize: '0.8rem',
                      }}
                    >
                      {filterLabelMap[filter]}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {!isReadOnly ? (
                  <button
                    onClick={onNavigateToSettings}
                    style={{
                      border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
                      background: PLANNER_THEME.controlBg,
                      color: PLANNER_THEME.controlText,
                      borderRadius: '999px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Reordenar nombres
                  </button>
                ) : null}
                <div
                  style={{
                    color: PLANNER_THEME.shellTextMuted,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Mostrando {filteredAgents.length} de {agents.length}
                </div>
              </div>
            </section>

            {filteredAgents.length > 0 ? (
              <PlanView
                weeklyPlan={weeklyPlan}
                weekDays={weekDays}
                agents={filteredAgents}
                activeShift={activeShift}
                assignmentsMap={assignmentsMap}
                coverageData={coverageData}
                onCellClick={isReadOnly ? async () => undefined : onCellClick}
                onCellContextMenu={isReadOnly ? () => undefined : onCellContextMenu}
                onEditDay={isReadOnly ? (() => undefined) as typeof onEditDay : onEditDay}
              />
            ) : (
              <section
                style={{
                  padding: '24px',
                  background: PLANNER_THEME.shellSurfaceTinted,
                  borderRadius: '16px',
                  border: `1px solid ${PLANNER_THEME.shellBorderStrong}`,
                  color: PLANNER_THEME.shellTextMuted,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  No hay representantes para el filtro actual.
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setQuickFilter('ALL')
                  }}
                  style={{
                    border: `1px solid ${PLANNER_THEME.controlBorderStrong}`,
                    background: PLANNER_THEME.controlBg,
                    color: PLANNER_THEME.controlText,
                    borderRadius: '999px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Limpiar filtros
                </button>
              </section>
            )}

            <PlanningCoverageChart
              coverageData={coverageData}
              canAccessSettings={!isReadOnly}
              onNavigateToSettings={onNavigateToSettings}
              weekDays={weekDays}
            />
          </div>
        ) : (
          <div>Cargando plan...</div>
        )}
      <style jsx>{`
        .planner-search-input::placeholder {
          color: rgba(247, 241, 232, 0.78);
        }
      `}</style>
    </>
  )
}
