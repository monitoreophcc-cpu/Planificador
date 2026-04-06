'use client'

import { useMemo, useState, type MouseEvent } from 'react'
import type {
  DayInfo,
  Incident,
  IncidentInput,
  ISODate,
  ShiftAssignment,
  ShiftType,
  SwapEvent,
} from '@/domain/types'
import type { EffectiveCoverageResult } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { CalendarDayModal } from './CalendarDayModal'
import { PromptDialog } from '../components/PromptDialog'
import { ManagerScheduleManagement } from '../settings/ManagerScheduleManagement'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { resolveIncidentDates } from '@/domain/incidents/resolveIncidentDates'
import { getEffectiveAssignmentsForPlanner } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { getEffectiveDailyCoverage } from '@/application/ui-adapters/getEffectiveDailyCoverage'
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan'
import { belongsToShiftThisWeek } from './belongsToShiftThisWeek'
import { PlanningOperationalPanel } from './PlanningOperationalPanel'
import { PlanningSectionHeader } from './PlanningSectionHeader'
import {
  PlanningSectionViewTabs,
  type PlanningSectionViewMode,
} from './PlanningSectionViewTabs'
import { SwapModal } from './SwapModal'

type PromptConfig = {
  open: boolean
  title: string
  description: string
  placeholder?: string
  optional?: boolean
  resolve: (value: string | undefined) => void
}

type SwapModalState = {
  isOpen: boolean
  repId: string | null
  date: ISODate | null
  shift: ShiftType | null
  existingSwap: SwapEvent | null
}

function createClosedSwapModalState(): SwapModalState {
  return {
    isOpen: false,
    repId: null,
    date: null,
    shift: null,
    existingSwap: null,
  }
}

function isRepresentativeInvolvedInSwap(
  swap: SwapEvent,
  representativeId: string
) {
  return (
    ('representativeId' in swap && swap.representativeId === representativeId) ||
    ('fromRepresentativeId' in swap &&
      swap.fromRepresentativeId === representativeId) ||
    ('toRepresentativeId' in swap && swap.toRepresentativeId === representativeId)
  )
}

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
  }))

  const activeRepresentatives = useMemo(
    () => representatives.filter(rep => rep.isActive !== false),
    [representatives]
  )

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
  const [swapModalState, setSwapModalState] = useState<SwapModalState>(
    createClosedSwapModalState()
  )

  const { showConfirm } = useAppStore(s => ({
    showConfirm: s.showConfirm,
  }))

  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)

  const showConfirmWithInput = (options: {
    title: string
    description: string
    placeholder?: string
    optional?: boolean
  }): Promise<string | undefined> => {
    return new Promise((resolve) => {
      setPromptConfig({
        open: true,
        ...options,
        resolve: (val) => {
          setPromptConfig(null)
          resolve(val)
        },
      })
    })
  }

  const handleOpenSwapManager = () => {
    setSwapModalState({
      isOpen: true,
      repId: null,
      date: planningAnchorDate,
      shift: activeShift,
      existingSwap: null,
    })
  }

  const handleCloseSwapModal = () => {
    setSwapModalState(createClosedSwapModalState())
  }

  const togglePlanOverride = async (
    representativeId: string,
    date: ISODate
  ) => {
    if (!weeklyPlan) return
    const rep = representatives.find(r => r.id === representativeId)
    if (!rep) return

    const blockingIncident = incidents.find(i => {
      if (i.representativeId !== representativeId) return false
      if (!['VACACIONES', 'LICENCIA'].includes(i.type)) return false

      const resolved = resolveIncidentDates(i, allCalendarDaysForRelevantMonths, rep)

      if (resolved.start && resolved.returnDate) {
        return date >= resolved.start && date < resolved.returnDate
      }

      return false
    })

    if (blockingIncident) return

    const agentPlan = weeklyPlan.agents.find(
      a => a.representativeId === representativeId
    )
    const dayPresence = agentPlan?.days[date]

    const existingOverride = incidents.find(
      i =>
        i.representativeId === representativeId &&
        i.startDate === date &&
        i.type === 'OVERRIDE'
    ) as (Incident & { previousAssignment?: ShiftAssignment }) | undefined

    if (existingOverride) {
      useAppStore.setState(state => {
        state.incidents = state.incidents.filter(i => i.id !== existingOverride.id)

        state.swaps = state.swaps.filter(swap => {
          if (swap.date !== date) return true
          return !isRepresentativeInvolvedInSwap(swap, representativeId)
        })
      })
      pushUndo({
        label: `Reaplicar cambio de turno de ${rep.name}`,
        undo: () => {
          useAppStore.setState(state => {
            state.incidents.push(existingOverride)
          })
        },
      })
      return
    }

    const previousAssignment = dayPresence?.assignment ?? { type: 'NONE' }
    let finalAssignment: ShiftAssignment | null

    if (previousAssignment?.type === 'BOTH') {
      finalAssignment = await showMixedShiftConfirmModal(
        representativeId,
        date,
        activeShift
      )
      if (finalAssignment === null) return
    } else {
      const isCurrentlyWorking =
        previousAssignment.type === 'SINGLE' &&
        previousAssignment.shift === activeShift
      finalAssignment = isCurrentlyWorking
        ? { type: 'NONE' }
        : { type: 'SINGLE', shift: activeShift }
    }

    const incidentInput: IncidentInput = {
      representativeId,
      startDate: date,
      type: 'OVERRIDE',
      duration: 1,
      assignment: finalAssignment,
      previousAssignment,
      note: undefined,
    }

    const result = await addIncident(incidentInput, true)

    if (result.ok) {
      pushUndo({
        label: `Deshacer cambio de turno de ${rep.name}`,
        undo: () => {
          useAppStore.setState(state => {
            state.incidents = state.incidents.filter(i => i.id !== result.newId)

            state.swaps = state.swaps.filter(swap => {
              if (swap.date !== date) return true
              return !isRepresentativeInvolvedInSwap(swap, representativeId)
            })
          })
        },
      })
    }
  }

  const handleCellContextMenu = async (
    repId: string,
    date: ISODate,
    e: MouseEvent
  ) => {
    e.preventDefault()

    const existingIncident = incidents.find(
      i =>
        i.representativeId === repId &&
        i.startDate === date &&
        i.type === 'OVERRIDE'
    )

    const result = await showConfirmWithInput({
      title: 'Comentario de Planificacion',
      description: 'Agrega o edita una nota para este dia:',
      placeholder: 'Ej: Permiso especial, cita medica, etc.',
      optional: true,
    })

    if (result === undefined) return

    const newNote = result.trim() || undefined

    if (existingIncident) {
      useAppStore.getState().updateIncident(existingIncident.id, { note: newNote })
    } else {
      if (!weeklyPlan) return
      const agentPlan = weeklyPlan.agents.find(a => a.representativeId === repId)
      const dayPresence = agentPlan?.days[date]
      const currentAssignment = dayPresence?.assignment ?? { type: 'NONE' }

      const incidentInput: IncidentInput = {
        representativeId: repId,
        startDate: date,
        type: 'OVERRIDE',
        duration: 1,
        assignment: currentAssignment,
        previousAssignment: currentAssignment,
        note: newNote,
      }

      if (newNote) {
        addIncident(incidentInput, true)
      }
    }
  }

  const assignmentsMap = useMemo(() => {
    if (!weeklyPlan) return {}
    return getEffectiveAssignmentsForPlanner(
      weeklyPlan,
      swaps,
      incidents,
      allCalendarDaysForRelevantMonths,
      representatives,
      specialSchedules
    )
  }, [
    weeklyPlan,
    swaps,
    incidents,
    allCalendarDaysForRelevantMonths,
    representatives,
    specialSchedules,
  ])

  const agentsToRender = useMemo(() => {
    if (!weeklyPlan) return []

    const planMap = new Map(
      weeklyPlan.agents.map(a => [a.representativeId, a])
    )

    return activeRepresentatives.filter(rep => {
      const agentPlan = planMap.get(rep.id)
      if (!agentPlan) return false

      return belongsToShiftThisWeek(
        agentPlan,
        weekDays,
        activeShift,
        rep,
        specialSchedules
      )
    })
  }, [weeklyPlan, weekDays, activeShift, activeRepresentatives, specialSchedules])

  const coverageData = useMemo(() => {
    if (!weeklyPlan) return {} as Record<ISODate, EffectiveCoverageResult>
    const data: Record<ISODate, EffectiveCoverageResult> = {}

    weekDays.forEach(day => {
      const result = getEffectiveDailyCoverage(
        weeklyPlan,
        swaps,
        coverageRules,
        day.date,
        incidents,
        allCalendarDaysForRelevantMonths,
        representatives,
        specialSchedules
      )
      data[day.date] = result[activeShift]
    })
    return data
  }, [weeklyPlan, swaps, coverageRules, weekDays, activeShift, incidents, allCalendarDaysForRelevantMonths, representatives, specialSchedules])

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
