'use client'

import { useState } from 'react'
import type {
  DayInfo,
  ShiftType,
} from '@/domain/types'
import { ManagerScheduleManagement } from '../settings/ManagerScheduleManagement'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan'
import { PlanningSectionHeader } from './PlanningSectionHeader'
import {
  PlanningSectionViewTabs,
  type PlanningSectionViewMode,
} from './PlanningSectionViewTabs'
import { usePlanningSectionDerivedData } from './usePlanningSectionDerivedData'
import { usePlanningSectionActions } from './usePlanningSectionActions'
import { PlanningSectionContent } from './PlanningSectionContent'
import { PlanningSectionModals } from './PlanningSectionModals'

export function PlanningSection({ onNavigateToSettings }: { onNavigateToSettings: () => void }) {
  const {
    representatives,
    coverageRules,
    planningAnchorDate,
    isLoading,
    addOrUpdateSpecialDay,
    removeSpecialDay,
    setPlanningAnchorDate,
    incidents,
    swaps,
    addIncident,
    showMixedShiftConfirmModal,
    allCalendarDaysForRelevantMonths,
    pushUndo,
    specialSchedules,
    showConfirm,
  } = useAppStore(s => ({
    representatives: s.representatives ?? [],
    coverageRules: s.coverageRules,
    planningAnchorDate: s.planningAnchorDate,
    isLoading: s.isLoading,
    addOrUpdateSpecialDay: s.addOrUpdateSpecialDay,
    removeSpecialDay: s.removeSpecialDay,
    setPlanningAnchorDate: s.setPlanningAnchorDate,
    incidents: s.incidents,
    addIncident: s.addIncident,
    showMixedShiftConfirmModal: s.showMixedShiftConfirmModal,
    swaps: s.swaps,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    pushUndo: s.pushUndo,
    specialSchedules: s.specialSchedules,
    showConfirm: s.showConfirm,
  }))

  const { mode } = useEditMode()

  const {
    weekDays,
    label: weekLabel,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleGoToday,
  } = useWeekNavigator(planningAnchorDate, setPlanningAnchorDate)

  const { weeklyPlan } = useWeeklyPlan(weekDays)

  const [activeShift, setActiveShift] = useState<ShiftType>('DAY')
  const [viewMode, setViewMode] =
    useState<PlanningSectionViewMode>('OPERATIONAL')
  const [editingDay, setEditingDay] = useState<DayInfo | null>(null)
  const {
    assignmentsMap,
    agentsToRender,
    coverageData,
  } = usePlanningSectionDerivedData({
    activeShift,
    allCalendarDaysForRelevantMonths,
    coverageRules,
    incidents,
    representatives,
    specialSchedules,
    swaps,
    weekDays,
    weeklyPlan,
  })

  const {
    handleCellContextMenu,
    handleCloseSwapModal,
    handleOpenSwapManager,
    promptConfig,
    swapModalState,
    togglePlanOverride,
  } = usePlanningSectionActions({
    activeShift,
    addIncident,
    allCalendarDaysForRelevantMonths,
    incidents,
    planningAnchorDate,
    pushUndo,
    representatives,
    showMixedShiftConfirmModal,
    weeklyPlan,
  })

  if (isLoading || weekDays.length === 0) {
    return (
      <div className="app-shell-loading" style={{ margin: '0 24px' }}>
        Cargando planificación...
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        padding: 'var(--space-lg)',
        borderRadius: '28px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <PlanningSectionHeader
        activeShift={activeShift}
        highlightAdminOverride={mode === 'ADMIN_OVERRIDE'}
        isCurrentWeek={isCurrentWeek}
        weekLabel={weekLabel}
        onGoToday={handleGoToday}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      <PlanningSectionViewTabs
        activeShift={activeShift}
        viewMode={viewMode}
        onSelectDay={() => {
          setActiveShift('DAY')
          setViewMode('OPERATIONAL')
        }}
        onSelectNight={() => {
          setActiveShift('NIGHT')
          setViewMode('OPERATIONAL')
        }}
        onSelectManagerial={() => setViewMode('MANAGERIAL')}
        onOpenSwapManager={handleOpenSwapManager}
      />

      <PlanningSectionContent
        activeShift={activeShift}
        assignmentsMap={assignmentsMap}
        coverageData={coverageData}
        agentsToRender={agentsToRender}
        onEditDay={setEditingDay}
        onNavigateToSettings={onNavigateToSettings}
        onTogglePlanOverride={togglePlanOverride}
        onCellContextMenu={handleCellContextMenu}
        viewMode={viewMode}
        weekDays={weekDays}
        weeklyPlan={weeklyPlan}
      />

      <PlanningSectionModals
        activeShift={activeShift}
        addOrUpdateSpecialDay={addOrUpdateSpecialDay}
        editingDay={editingDay}
        onClearDay={async date => {
          const confirmed = await showConfirm({
            title: '¿Quitar Excepción?',
            description: `Esto restaurará el comportamiento por defecto del día ${date}.`,
            intent: 'warning',
          })
          if (confirmed) {
            removeSpecialDay(date)
          }
        }}
        onCloseEditDay={() => setEditingDay(null)}
        onCloseSwapModal={handleCloseSwapModal}
        planningAnchorDate={planningAnchorDate}
        promptConfig={promptConfig}
        swapModalState={swapModalState}
        weeklyPlan={weeklyPlan}
      />
    </div>
  )
}
