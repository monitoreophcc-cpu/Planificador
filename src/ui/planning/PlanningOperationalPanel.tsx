'use client'

import type { Dispatch, MouseEvent, SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type {
  DayInfo,
  ISODate,
  Representative,
  ShiftType,
  WeeklyPlan,
} from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import type { PlannerAssignmentsMap } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { CoverageChart } from '../coverage/CoverageChart'
import { CoverageRulesPanel } from '../coverage/CoverageRulesPanel'
import { PlanView } from './PlanView'

interface PlanningOperationalPanelProps {
  activeShift: ShiftType
  assignmentsMap: PlannerAssignmentsMap
  coverageData: Record<ISODate, EffectiveCoverageResult>
  agents: Representative[]
  weekDays: DayInfo[]
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

export function PlanningOperationalPanel({
  activeShift,
  assignmentsMap,
  coverageData,
  agents,
  weekDays,
  weeklyPlan,
  onCellClick,
  onCellContextMenu,
  onEditDay,
  onNavigateToSettings,
}: PlanningOperationalPanelProps) {
  const hasAnyCoverageRule = Object.values(coverageData).some(
    coverage => coverage.required > 0
  )

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={weeklyPlan ? weeklyPlan.weekStart + activeShift : activeShift}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {weeklyPlan ? (
          <div
            style={{
              display: 'flex',
              overflowX: 'hidden',
              gap: 'var(--space-xl)',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                borderRadius: '24px',
                border: '1px solid var(--shell-border)',
                background:
                  'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.32) 100%)',
                boxShadow: 'var(--shadow-sm)',
                padding: '18px',
              }}
            >
              <PlanView
                weeklyPlan={weeklyPlan}
                weekDays={weekDays}
                agents={agents}
                activeShift={activeShift}
                assignmentsMap={assignmentsMap}
                onCellClick={onCellClick}
                onCellContextMenu={onCellContextMenu}
                onEditDay={onEditDay}
              />
            </div>

            <aside
              style={{
                position: 'sticky',
                top: '20px',
                width: '340px',
                flexShrink: 0,
                padding: '18px',
                borderRadius: '24px',
                border: '1px solid var(--shell-border)',
                background:
                  'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-tint) 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-lg)',
                }}
              >
                {hasAnyCoverageRule ? (
                  <CoverageChart data={coverageData} />
                ) : (
                  <div
                    style={{
                      marginBottom: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--surface-veil) 100%)',
                      borderRadius: '18px',
                      border: '1px dashed var(--border-strong)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    Sin reglas de cobertura activas.
                  </div>
                )}

                <CoverageRulesPanel
                  onNavigateToSettings={onNavigateToSettings}
                />
              </div>
            </aside>
          </div>
        ) : (
          <div>Cargando plan...</div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
