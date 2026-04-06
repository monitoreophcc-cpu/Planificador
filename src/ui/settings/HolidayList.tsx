import { Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import type { ISODate, SpecialDay } from '@/domain/types'
import { formatHolidayDate } from './holidayManagementHelpers'

type HolidayListProps = {
  canDelete: boolean
  holidays: SpecialDay[]
  onDelete: (date: ISODate) => void
}

export function HolidayList({
  canDelete,
  holidays,
  onDelete,
}: HolidayListProps) {
  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--text-main)' }}>
        Feriados Configurados ({holidays.length})
      </h3>

      {holidays.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <CalendarIcon size={48} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            No hay feriados configurados
          </p>
          <p style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
            Agregue los feriados del año para que se excluyan del cálculo de vacaciones
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
                padding: '12px 16px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '4px',
                    height: '40px',
                    background: '#fbbf24',
                    borderRadius: '2px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                    {holiday.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatHolidayDate(holiday.date)}
                  </div>
                </div>
              </div>
              {canDelete && (
                <button
                  onClick={() => onDelete(holiday.date)}
                  aria-label={`Eliminar feriado ${holiday.label}`}
                  title="Eliminar feriado"
                  style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
