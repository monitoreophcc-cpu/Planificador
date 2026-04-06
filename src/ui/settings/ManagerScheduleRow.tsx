'use client'

import { Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DayInfo, Incident, Representative } from '@/domain/types'
import type { Manager, ManagerWeeklyPlan } from '@/domain/management/types'
import type { ManagerLoadResult } from '@/domain/management/calculateManagerLoad'
import { ManagerIdentityCell } from './ManagerIdentityCell'
import { ManagerScheduleWeekCells } from './ManagerScheduleWeekCells'
import {
  getManagerLoadColor,
  getManagerLoadProgress,
} from './managerScheduleRowHelpers'

type ManagerScheduleRowProps = {
  allCalendarDaysForRelevantMonths: DayInfo[]
  computedManager: ManagerLoadResult
  handleDutyChange: (managerId: string, date: string, value: string) => void
  incidents: Incident[]
  manager: Manager
  mostLoadedManagerId: string | null
  removeManager: (id: string) => void
  representative?: Representative
  weekDays: DayInfo[]
  weeklyPlan: ManagerWeeklyPlan | null
}

export function ManagerScheduleRow({
  allCalendarDaysForRelevantMonths,
  computedManager,
  handleDutyChange,
  incidents,
  manager,
  mostLoadedManagerId,
  removeManager,
  representative,
  weekDays,
  weeklyPlan,
}: ManagerScheduleRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: manager.id })

  const weeklyLoad = computedManager.load
  const isMostLoaded = mostLoadedManagerId === manager.id
  const loadColor = getManagerLoadColor(weeklyLoad)
  const progress = getManagerLoadProgress(weeklyLoad)

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
      }}
      {...attributes}
      {...listeners}
    >
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
          <ManagerIdentityCell
            isMostLoaded={isMostLoaded}
          loadColor={loadColor}
          managerName={manager.name}
          progress={progress}
          weeklyLoad={weeklyLoad}
        />
      </td>

      <ManagerScheduleWeekCells
        allCalendarDaysForRelevantMonths={allCalendarDaysForRelevantMonths}
        handleDutyChange={handleDutyChange}
        incidents={incidents}
        manager={manager}
        representative={representative}
        weekDays={weekDays}
        weeklyPlan={weeklyPlan}
      />

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
    </tr>
  )
}
