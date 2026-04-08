import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { SpecialSchedule } from '@/domain/types'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditMode } from '@/hooks/useEditMode'

interface SpecialScheduleListProps {
  hideHeader?: boolean
  repId: string
  onEdit: (schedule: SpecialSchedule) => void
  expanded?: boolean
  variant?: 'card' | 'panel'
}

export function SpecialScheduleList({
  hideHeader = false,
  repId,
  onEdit,
  expanded = false,
  variant = 'card',
}: SpecialScheduleListProps) {
  const { specialSchedules, removeSpecialSchedule } = useAppStore(s => ({
    specialSchedules: s.specialSchedules.filter(
      ss => ss.scope === 'INDIVIDUAL' && ss.targetId === repId
    ),
    removeSpecialSchedule: s.removeSpecialSchedule,
  }))
  const { mode } = useEditMode()
  const [showAll, setShowAll] = useState(false)

  const schedulesToRender = useMemo(() => {
    if (expanded || showAll) {
      return specialSchedules
    }

    return specialSchedules.slice(0, 1)
  }, [expanded, showAll, specialSchedules])

  const hiddenCount = specialSchedules.length - schedulesToRender.length

  if (specialSchedules.length === 0) return null

  const renderPatternSummary = (pattern: SpecialSchedule['weeklyPattern']) => {
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
        {days.map((day, index) => {
          const state = pattern[index as 0 | 1 | 2 | 3 | 4 | 5 | 6]
          if (!state) return null

          if (state === 'OFF') {
            return (
              <span
                key={index}
                title={`${day}: Libre`}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: 700,
                }}
              >
                {day}
              </span>
            )
          }

          if (state === 'MIXTO') {
            return (
              <span
                key={index}
                title={`${day}: Mixto`}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  fontWeight: 700,
                }}
              >
                {day}*
              </span>
            )
          }

          if (state === 'DAY') {
            return (
              <span
                key={index}
                title={`${day}: Día`}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 700,
                }}
              >
                {day}
              </span>
            )
          }

          return (
            <span
              key={index}
              title={`${day}: Noche`}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#dcfce7',
                color: '#166534',
                fontWeight: 700,
              }}
            >
              {day}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{
        marginTop: variant === 'card' ? '14px' : 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderTop:
          variant === 'card' ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
        paddingTop: variant === 'card' ? '12px' : 0,
      }}
    >
      {!hideHeader ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#4f46e5',
              }}
            >
              Horarios especiales
            </span>
            <span
              style={{
                padding: '5px 8px',
                borderRadius: '999px',
                background: '#eef2ff',
                color: '#4338ca',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {specialSchedules.length} activo(s)
            </span>
          </div>

          {!expanded && specialSchedules.length > 1 ? (
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                setShowAll(previous => !previous)
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#4f46e5',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
              }}
            >
              {showAll ? (
                <>
                  <ChevronUp size={14} />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Ver {specialSchedules.length} horarios
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {schedulesToRender.map(schedule => (
          <div
            key={schedule.id}
            style={{
              fontSize: '12px',
              color: '#4b5563',
              background: expanded
                ? variant === 'panel'
                  ? 'rgba(255,255,255,0.92)'
                  : 'rgba(248,250,252,0.96)'
                : 'rgba(248,250,252,0.78)',
              padding: '10px 12px',
              borderRadius: variant === 'panel' ? '12px' : '10px',
              border:
                variant === 'panel'
                  ? '1px solid rgba(99, 102, 241, 0.14)'
                  : '1px solid rgba(148, 163, 184, 0.14)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Calendar size={14} />
                <span style={{ fontWeight: 700, color: '#334155' }}>
                  {format(parseISO(schedule.from), 'dd/MM/yy')} -{' '}
                  {format(parseISO(schedule.to), 'dd/MM/yy')}
                </span>
              </div>
              {schedule.note ? (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  <StickyNote size={10} />
                  <span style={{ fontStyle: 'italic' }}>{schedule.note}</span>
                </div>
              ) : null}
              {expanded ? renderPatternSummary(schedule.weeklyPattern) : null}
              {!expanded ? (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: '#64748b',
                  }}
                >
                  Selecciona la ficha para ver el patrón semanal completo.
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={event => {
                  event.stopPropagation()
                  onEdit(schedule)
                }}
                style={{
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Editar Horario"
              >
                <Edit size={14} />
              </button>
              {mode === 'ADMIN_OVERRIDE' ? (
                <button
                  onClick={event => {
                    event.stopPropagation()
                    removeSpecialSchedule(schedule.id)
                  }}
                  style={{
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="Eliminar Horario"
                >
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {!expanded && hiddenCount > 0 && !showAll ? (
        <div
          style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: 1.5,
          }}
        >
          Hay {hiddenCount} horario(s) adicional(es) ocultos para mantener la lista
          compacta.
        </div>
      ) : null}
    </div>
  )
}
