'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Trash2, Plus } from 'lucide-react'
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DayInfo, Incident, Representative } from '@/domain/types'
import type {
  Manager,
  ManagerDuty,
  ManagerWeeklyPlan,
} from '@/domain/management/types'
import type { ManagerLoadResult } from '@/domain/management/calculateManagerLoad'
import { resolveEffectiveManagerDay } from '@/application/ui-adapters/resolveEffectiveManagerDay'
import { mapManagerDayToCell } from '@/application/ui-adapters/mapManagerDayToCell'
import { ManagerPlannerCell } from '@/ui/management/ManagerPlannerCell'

function SortableRow({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  }

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  )
}

function getLoadColor(weeklyLoad: number) {
  if (weeklyLoad > 50) return '#ef4444'
  if (weeklyLoad > 44) return '#f97316'
  if (weeklyLoad > 38) return '#eab308'
  return '#22c55e'
}

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
  sensors: any
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
          <thead>
            <tr
              style={{
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <th style={{ width: '30px' }}></th>
              <th
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-md)',
                  color: 'var(--text-muted)',
                  fontWeight: 'var(--font-weight-semibold)',
                  width: '200px',
                }}
              >
                Supervisor
              </th>
              {weekDays.map(day => (
                <th
                  key={day.date}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-md) var(--space-sm)',
                    color: 'var(--text-muted)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  <div>{format(parseISO(day.date), 'EEE', { locale: es })}</div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-faint)',
                      fontWeight: 'var(--font-weight-normal)',
                    }}
                  >
                    {format(parseISO(day.date), 'd')}
                  </div>
                </th>
              ))}
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
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
                const weeklyLoad = computedManager.load
                const isMostLoaded = mostLoadedManagerId === manager.id
                const loadColor = getLoadColor(weeklyLoad)
                const progress = Math.min((weeklyLoad / 55) * 100, 100)

                return (
                  <SortableRow key={manager.id} id={manager.id}>
                    <td
                      style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        cursor: 'grab',
                        touchAction: 'none',
                      }}
                    >
                      ⋮ ::
                    </td>
                    <td
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        color: 'var(--text-main)',
                        fontWeight: 'var(--font-weight-medium)',
                        borderRight: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              background: '#eff6ff',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#3b82f6',
                            }}
                          >
                            <User size={14} />
                          </div>
                          {manager.name}
                          {isMostLoaded && (
                            <span
                              title="Mayor carga horaria esta semana"
                              style={{
                                fontSize: '11px',
                                color: '#9ca3af',
                                marginLeft: '2px',
                                cursor: 'help',
                              }}
                            >
                              ●
                            </span>
                          )}
                        </div>

                        <div
                          title={`Carga horaria semanal: ${weeklyLoad.toFixed(
                            1
                          )} h\n\nIncluye duración real de turnos.\nNo mide desempeño ni productividad.\nUsado solo para balance de planificación.`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            color: '#6b7280',
                            paddingLeft: '32px',
                          }}
                        >
                          <div
                            style={{
                              width: '60px',
                              height: '4px',
                              background: '#e5e7eb',
                              borderRadius: '2px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: loadColor,
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 500 }}>
                            {Number(weeklyLoad.toFixed(1))}h
                          </span>
                        </div>
                      </div>
                    </td>
                    {weekDays.map(day => {
                      const effectiveDay = resolveEffectiveManagerDay(
                        weeklyPlan,
                        incidents,
                        day.date,
                        allCalendarDaysForRelevantMonths,
                        representative
                      )

                      const cellState = mapManagerDayToCell(
                        effectiveDay,
                        manager.name
                      )

                      let currentValue = 'EMPTY'
                      if (effectiveDay.kind === 'DUTY') {
                        currentValue = effectiveDay.duty
                      } else if (effectiveDay.kind === 'OFF') {
                        currentValue = 'OFF'
                      }

                      const isEditable =
                        cellState.isEditable &&
                        effectiveDay.kind !== 'VACATION' &&
                        effectiveDay.kind !== 'LICENSE'

                      return (
                        <td key={day.date} style={{ padding: '6px' }}>
                          <ManagerPlannerCell
                            state={cellState.state}
                            label={cellState.label}
                            tooltip={cellState.tooltip}
                            currentValue={currentValue}
                            onChange={
                              isEditable
                                ? value =>
                                    handleDutyChange(manager.id, day.date, value)
                                : undefined
                            }
                          />
                        </td>
                      )
                    })}
                    <td style={{ padding: '0 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeManager(manager.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#fee2e2',
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </SortableRow>
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

            <tr style={{ background: 'var(--bg-subtle)' }}>
              <td style={{ padding: 'var(--space-md)' }} colSpan={2}>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <input
                    placeholder="Nuevo Supervisor..."
                    value={newManagerName}
                    onChange={event => onNewManagerNameChange(event.target.value)}
                    onKeyDown={event =>
                      event.key === 'Enter' && handleCreateManager()
                    }
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-sm)',
                      fontSize: 'var(--font-size-base)',
                      flex: 1,
                      outline: 'none',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <button
                    onClick={handleCreateManager}
                    disabled={!newManagerName.trim()}
                    style={{
                      background: 'var(--success)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: !newManagerName.trim() ? 0.5 : 1,
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </td>
              <td colSpan={8}></td>
            </tr>
          </tbody>
        </table>
      </DndContext>
    </div>
  )
}
