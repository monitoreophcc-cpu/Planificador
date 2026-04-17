'use client'

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
import { ManagerScheduleManagement } from '../settings/ManagerScheduleManagement'
import { PlanningOperationalPanel } from './PlanningOperationalPanel'
import type { PlanningSectionViewMode } from './PlanningSectionViewTabs'

type PlanningSectionContentProps = {
  activeShift: ShiftType
  assignmentsMap: PlannerAssignmentsMap
  coverageData: Record<ISODate, EffectiveCoverageResult>
  agentsToRender: Representative[]
  incidents: Incident[]
  isCurrentWeek: boolean
  isReadOnly?: boolean
  onEditDay: React.Dispatch<React.SetStateAction<DayInfo | null>>
  onNavigateToSettings: () => void
  onTogglePlanOverride: (
    representativeId: string,
    date: ISODate
  ) => Promise<void>
  onCellContextMenu: (
    representativeId: string,
    date: ISODate,
    event: React.MouseEvent
  ) => void
  representatives: Representative[]
  viewMode: PlanningSectionViewMode
  weekDays: DayInfo[]
  weekLabel: string
  weeklyPlan: WeeklyPlan | null
}

export function PlanningSectionContent({
  activeShift,
  assignmentsMap,
  coverageData,
  agentsToRender,
  incidents,
  isCurrentWeek,
  isReadOnly = false,
  onEditDay,
  onNavigateToSettings,
  onTogglePlanOverride,
  onCellContextMenu,
  representatives,
  viewMode,
  weekDays,
  weekLabel,
  weeklyPlan,
}: PlanningSectionContentProps) {
  if (viewMode !== 'OPERATIONAL') {
    return <ManagerScheduleManagement embedded />
  }

  return (
    <PlanningOperationalPanel
      activeShift={activeShift}
      assignmentsMap={assignmentsMap}
      coverageData={coverageData}
      agents={agentsToRender}
      incidents={incidents}
      isCurrentWeek={isCurrentWeek}
      isReadOnly={isReadOnly}
      representatives={representatives}
      weekDays={weekDays}
      weekLabel={weekLabel}
      weeklyPlan={weeklyPlan}
      onCellClick={onTogglePlanOverride}
      onCellContextMenu={onCellContextMenu}
      onEditDay={onEditDay}
      onNavigateToSettings={onNavigateToSettings}
    />
  )
}
