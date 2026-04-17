'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAccess } from '@/hooks/useAccess'
import type {
  DayInfo,
  ISODate,
  ShiftType,
} from '@/domain/types'
import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan'
import {
  PlanningSectionViewTabs,
  type PlanningSectionViewMode,
} from './PlanningSectionViewTabs'
import { usePlanningSectionDerivedData } from './usePlanningSectionDerivedData'
import { usePlanningSectionActions } from './usePlanningSectionActions'
import { PlanningSectionContent } from './PlanningSectionContent'
import { PlanningSectionModals } from './PlanningSectionModals'
import { ReadOnlyNotice } from '@/ui/system/ReadOnlyNotice'

export function PlanningSection({ onNavigateToSettings }: { onNavigateToSettings: () => void }) {
  const { canEditData, isReadOnly } = useAccess()
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

  const {
    weekDays,
    label: weekLabel,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleGoToday,
  } = useWeekNavigator(planningAnchorDate, setPlanningAnchorDate)

  const { weeklyPlan } = useWeeklyPlan(weekDays)
  const weekControlLabel = useMemo(() => {
    if (weekDays.length === 0) {
      return weekLabel
    }

    const start = new Date(`${weekDays[0].date}T12:00:00Z`)
    const end = new Date(`${weekDays[weekDays.length - 1].date}T12:00:00Z`)
    const sameMonthYear =
      format(start, 'MMMM yyyy', { locale: es }) ===
      format(end, 'MMMM yyyy', { locale: es })

    if (sameMonthYear) {
      return `${format(start, 'd')}–${format(end, 'd MMMM yyyy', {
        locale: es,
      })}`
    }

    return `${format(start, 'd MMM', { locale: es })}–${format(
      end,
      'd MMM yyyy',
      { locale: es }
    )}`
  }, [weekDays, weekLabel])

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
        gap: '20px',
      }}
    >
      <PlanningSectionViewTabs
        activeShift={activeShift}
        canEditData={canEditData}
        isCurrentWeek={isCurrentWeek}
        planningAnchorDate={planningAnchorDate}
        viewMode={viewMode}
        weekControlLabel={weekControlLabel}
        onGoToday={handleGoToday}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onSelectWeekDate={(date: ISODate) => setPlanningAnchorDate(date)}
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

      {isReadOnly ? (
        <ReadOnlyNotice description="Puedes recorrer semanas, revisar coberturas y consultar la planificación, pero no gestionar cambios ni editar excepciones." />
      ) : null}

      <PlanningSectionContent
        activeShift={activeShift}
        assignmentsMap={assignmentsMap}
        coverageData={coverageData}
        agentsToRender={agentsToRender}
        incidents={incidents}
        isCurrentWeek={isCurrentWeek}
        isReadOnly={!canEditData}
        onEditDay={setEditingDay}
        onNavigateToSettings={onNavigateToSettings}
        onTogglePlanOverride={togglePlanOverride}
        onCellContextMenu={handleCellContextMenu}
        representatives={representatives}
        viewMode={viewMode}
        weekDays={weekDays}
        weekLabel={weekLabel}
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
