'use client'

import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { DayInfo, Incident, Representative } from '@/domain/types'
import type {
  Manager,
  ManagerWeeklyPlan,
} from '@/domain/management/types'
import type { ManagerLoadResult } from '@/domain/management/calculateManagerLoad'
import { ManagerScheduleCreateRow } from './ManagerScheduleCreateRow'
import { ManagerScheduleRow } from './ManagerScheduleRow'
import { ManagerScheduleTableHeader } from './ManagerScheduleTableHeader'

interface ManagerScheduleTableProps {
  allCalendarDaysForRelevantMonths: DayInfo[]
  handleCreateManager: () => void
  handleDutyChange: (managerId: string, date: string, value: string) => void
  incidents: Incident[]
  managementSchedules: Record<string, ManagerWeeklyPlan>
  managerLoads: ManagerLoadResult[]
  managers: Manager[]
  mostLoadedManagerId: string | null
  newManagerName: string
  onDragEnd: (event: DragEndEvent) => void
  onNewManagerNameChange: (value: string) => void
  removeManager: (id: string) => void
  representatives: Representative[]
  sensors: ReturnType<typeof useSensors>
  weekDays: DayInfo[]
}

export function ManagerScheduleTable({
  allCalendarDaysForRelevantMonths,
  handleCreateManager,
  handleDutyChange,
  incidents,
  managementSchedules,
  managerLoads,
  managers,
  mostLoadedManagerId,
  newManagerName,
  onDragEnd,
  onNewManagerNameChange,
  removeManager,
  representatives,
  sensors,
  weekDays,
}: ManagerScheduleTableProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--font-size-base)',
          }}
        >
          <ManagerScheduleTableHeader weekDays={weekDays} />
          <tbody>
            <SortableContext
              items={managerLoads.map(manager => manager.id)}
              strategy={verticalListSortingStrategy}
            >
              {managerLoads.map(computedManager => {
                const manager = managers.find(item => item.id === computedManager.id)
                if (!manager) return null

                const representative = representatives.find(
                  rep => rep.id === manager.id
                )
                const weeklyPlan = managementSchedules[manager.id] || null

                return (
                  <ManagerScheduleRow
                    key={manager.id}
                    allCalendarDaysForRelevantMonths={
                      allCalendarDaysForRelevantMonths
                    }
                    computedManager={computedManager}
                    handleDutyChange={handleDutyChange}
                    incidents={incidents}
                    manager={manager}
                    mostLoadedManagerId={mostLoadedManagerId}
                    removeManager={removeManager}
                    representative={representative}
                    weekDays={weekDays}
                    weeklyPlan={weeklyPlan}
                  />
                )
              })}
            </SortableContext>

            {managers.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: 'var(--space-xl)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  No hay supervisores registrados. Añade uno abajo.
                </td>
              </tr>
            )}

            <ManagerScheduleCreateRow
              newManagerName={newManagerName}
              onCreateManager={handleCreateManager}
              onNewManagerNameChange={onNewManagerNameChange}
            />
          </tbody>
        </table>
      </DndContext>
    </div>
  )
}
