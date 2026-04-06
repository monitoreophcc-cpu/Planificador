'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayInfo } from '@/domain/types'

export function ManagerScheduleTableHeader({
  weekDays,
}: {
  weekDays: DayInfo[]
}) {
  return (
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
  )
}
