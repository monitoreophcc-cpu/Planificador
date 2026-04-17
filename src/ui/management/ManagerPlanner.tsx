'use client'

import { useAppStore } from '@/store/useAppStore'
import { useWeekNavigator } from '@/hooks/useWeekNavigator'
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan'
import { PlanRow } from '@/ui/planning/PlanRow'
import { getEffectiveAssignmentsForPlanner } from '@/application/ui-adapters/getEffectiveAssignmentsForPlanner'
import { useMemo, useState } from 'react'
import { ManagementPlannerToolbar } from './ManagementPlannerToolbar'

/**
 * 🧩 PLANNER GERENCIAL — Vista filtrada del planner operativo
 * 
 * PRINCIPIO:
 * - Gerencia = Representantes con role: 'MANAGER'
 * - Reusa TODO: WeeklyPlan, resolveEffectiveDuty, PlanCell, mappers
 * - Solo cambia: filtro de quién se muestra + labels visibles
 * 
 * NO HAY:
 * - ❌ Motor nuevo
 * - ❌ Estados nuevos
 * - ❌ Lógica paralela
 * - ❌ Validaciones especiales
 * 
 * SÍ HAY:
 * - ✅ Mismo WeeklyPlan
 * - ✅ Mismas incidencias (VACACIONES, LICENCIA)
 * - ✅ Mismos overrides
 * - ✅ Mismas celdas (PlanCell)
 */
export function ManagerPlanner() {
  const {
    representatives,
    planningAnchorDate,
    setPlanningAnchorDate,
    incidents,
    swaps,
    allCalendarDaysForRelevantMonths,
    specialSchedules,
  } = useAppStore(s => ({
    representatives: s.representatives,
    planningAnchorDate: s.planningAnchorDate,
    setPlanningAnchorDate: s.setPlanningAnchorDate,
    incidents: s.incidents,
    swaps: s.swaps,
    allCalendarDaysForRelevantMonths: s.allCalendarDaysForRelevantMonths,
    specialSchedules: s.specialSchedules,
  }))

  const {
    weekDays,
    label,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleGoToday,
  } = useWeekNavigator(planningAnchorDate, setPlanningAnchorDate)

  const [activeShift, setActiveShift] = useState<'DAY' | 'NIGHT'>('DAY')

  const { weeklyPlan } = useWeeklyPlan(weekDays)

  const managers = representatives.filter(
    r => r.role === 'MANAGER' && r.isActive !== false
  )

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
    representatives,
    swaps,
    incidents,
    allCalendarDaysForRelevantMonths,
    specialSchedules,
  ])

  if (!weeklyPlan) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ManagementPlannerToolbar
        title="Horario Gerencial"
        label={label}
        anchorDate={planningAnchorDate}
        isCurrentWeek={isCurrentWeek}
        trailing={
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid var(--shell-border)',
              background: 'rgba(255,255,255,0.74)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveShift('DAY')}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid transparent',
                background:
                  activeShift === 'DAY'
                    ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.72) 100%)'
                    : 'transparent',
                color:
                  activeShift === 'DAY'
                    ? 'var(--accent-strong)'
                    : 'var(--text-muted)',
                fontWeight: activeShift === 'DAY' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Turno Día
            </button>
            <button
              type="button"
              onClick={() => setActiveShift('NIGHT')}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid transparent',
                background:
                  activeShift === 'NIGHT'
                    ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.72) 100%)'
                    : 'transparent',
                color:
                  activeShift === 'NIGHT'
                    ? 'var(--accent-strong)'
                    : 'var(--text-muted)',
                fontWeight: activeShift === 'NIGHT' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Turno Noche
            </button>
          </div>
        }
        onGoToday={handleGoToday}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onSelectWeekDate={setPlanningAnchorDate}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px repeat(7, 1fr)',
        gap: '8px'
      }}>
        {/* Header row */}
        <div style={{ fontWeight: 600, padding: '8px' }}>Supervisor</div>
        {weekDays.map(d => (
          <div
            key={d.date}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px',
            }}
          >
            {d.label}
          </div>
        ))}

        {/* Manager rows */}
        {managers.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '24px',
            color: '#9ca3af'
          }}>
            No hay gerentes activos
          </div>
        ) : (
          managers.map(manager => (
            <PlanRow
              key={manager.id}
              agent={manager}
              weekDays={weekDays}
              weeklyPlan={weeklyPlan}
              activeShift={activeShift}
              assignmentsMap={assignmentsMap}
              onCellClick={() => { }}
              onCellContextMenu={() => { }}
            />
          ))
        )}
      </div>
    </div>
  )
}
