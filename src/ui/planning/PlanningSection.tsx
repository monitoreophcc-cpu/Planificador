'use client'

import { useState } from 'react'
import type {
  DayInfo,
  ShiftType,
} from '@/domain/types'
import { CalendarDayModal } from './CalendarDayModal'
import { PromptDialog } from '../components/PromptDialog'
import { ManagerScheduleManagement } from '../settings/ManagerScheduleManagement'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan'
import { PlanningOperationalPanel } from './PlanningOperationalPanel'
import { PlanningSectionHeader } from './PlanningSectionHeader'
import {
  PlanningSectionViewTabs,
  type PlanningSectionViewMode,
} from './PlanningSectionViewTabs'
import { SwapModal } from './SwapModal'
import { usePlanningSectionDerivedData } from './usePlanningSectionDerivedData'
import { usePlanningSectionActions } from './usePlanningSectionActions'

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
      <div style={{ padding: 'var(--space-xl)', fontFamily: 'sans-serif', color: 'var(--text-muted)' }}>
        Cargando planificación...
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: 'var(--space-lg)' }}>
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

      {viewMode === 'OPERATIONAL' ? (
        <PlanningOperationalPanel
          activeShift={activeShift}
          assignmentsMap={assignmentsMap}
          coverageData={coverageData}
          agents={agentsToRender}
          weekDays={weekDays}
          weeklyPlan={weeklyPlan}
          onCellClick={togglePlanOverride}
          onCellContextMenu={handleCellContextMenu}
          onEditDay={setEditingDay}
          onNavigateToSettings={onNavigateToSettings}
        />
      ) : (
        <ManagerScheduleManagement embedded />
      )}

      {editingDay && (
        <CalendarDayModal
          day={editingDay}
          onClose={() => setEditingDay(null)}
          onSave={addOrUpdateSpecialDay}
          onClear={async date => {
            const confirmed = await showConfirm({
              title: '¿Quitar Excepción?',
              description: `Esto restaurará el comportamiento por defecto del día ${date}.`,
              intent: 'warning',
            })
            if (confirmed) {
              removeSpecialDay(date)
            }
          }}
        />
      )}

      {swapModalState.isOpen && weeklyPlan && (
        <SwapModal
          weeklyPlan={weeklyPlan}
          initialDate={swapModalState.date || planningAnchorDate}
          initialShift={swapModalState.shift || activeShift}
          initialRepId={swapModalState.repId || undefined}
          existingSwap={swapModalState.existingSwap || undefined}
          onClose={handleCloseSwapModal}
        />
      )}

      {promptConfig && (
        <PromptDialog
          open={promptConfig.open}
          title={promptConfig.title}
          description={promptConfig.description}
          placeholder={promptConfig.placeholder}
          optional={promptConfig.optional}
          onConfirm={(val) => promptConfig.resolve(val)}
          onCancel={() => promptConfig.resolve(undefined)}
        />
      )}
    </div>
  )
}
