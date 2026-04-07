'use client'

import type {
  DayInfo,
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
  viewMode: PlanningSectionViewMode
  weekDays: DayInfo[]
  weeklyPlan: WeeklyPlan | null
}

export function PlanningSectionContent({
  activeShift,
  assignmentsMap,
  coverageData,
  agentsToRender,
  onEditDay,
  onNavigateToSettings,
  onTogglePlanOverride,
  onCellContextMenu,
  viewMode,
  weekDays,
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
      weekDays={weekDays}
      weeklyPlan={weeklyPlan}
      onCellClick={onTogglePlanOverride}
      onCellContextMenu={onCellContextMenu}
      onEditDay={onEditDay}
      onNavigateToSettings={onNavigateToSettings}
    />
  )
}
