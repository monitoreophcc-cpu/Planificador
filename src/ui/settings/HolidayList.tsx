import { Calendar as CalendarIcon, PencilLine, Trash2 } from 'lucide-react'
import type { ISODate, SpecialDay } from '@/domain/types'
import { formatHolidayDate } from './holidayManagementHelpers'

type HolidayListProps = {
  canDelete: boolean
  description?: string
  emptyMessage?: string
  highlightDate?: ISODate | null
  holidays: SpecialDay[]
  onEdit?: (holiday: SpecialDay) => void
  onDelete: (date: ISODate) => void
  title?: string
}

export function HolidayList({
  canDelete,
  description,
  emptyMessage = 'Agrega feriados para que el calendario tenga una referencia operativa clara.',
  highlightDate,
  holidays,
  onEdit,
  onDelete,
  title,
}: HolidayListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>
          {title ?? `Feriados configurados (${holidays.length})`}
        </h3>
        {description ? (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {holidays.length === 0 ? (
        <div
          style={{
            padding: '34px 24px',
            textAlign: 'center',
            background: 'rgba(248,250,252,0.9)',
            borderRadius: '16px',
            border: '1px dashed rgba(148, 163, 184, 0.24)',
          }}
        >
          <CalendarIcon size={42} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', fontWeight: 700 }}>
            No hay feriados en esta vista
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.6 }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {holidays.map(holiday => (
            <div
              key={holiday.date}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                padding: '14px 16px',
                background:
                  highlightDate === holiday.date
                    ? 'linear-gradient(180deg, rgba(245,243,255,0.9) 0%, rgba(255,255,255,0.98) 100%)'
                    : 'rgba(255,255,255,0.98)',
                border:
                  highlightDate === holiday.date
                    ? '1px solid rgba(124, 58, 237, 0.18)'
                    : '1px solid rgba(148, 163, 184, 0.16)',
                borderRadius: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#f59e0b',
                    borderRadius: '999px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {holiday.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {formatHolidayDate(holiday.date)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(holiday)}
                    aria-label={`Editar feriado ${holiday.label}`}
                    title="Editar feriado"
                    style={{
                      padding: '8px 10px',
                      background: 'white',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      cursor: 'pointer',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    <PencilLine size={15} />
                    Editar
                  </button>
                ) : null}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(holiday.date)}
                    aria-label={`Eliminar feriado ${holiday.label}`}
                    title="Eliminar feriado"
                    style={{
                      padding: '8px',
                      background: 'rgba(254, 242, 242, 0.9)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      cursor: 'pointer',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '10px',
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
