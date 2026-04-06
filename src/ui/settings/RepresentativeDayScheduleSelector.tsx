'use client'

import type { BaseSchedule } from '@/domain/types'

interface RepresentativeDayScheduleSelectorProps {
  schedule: BaseSchedule
  onChange: (newSchedule: BaseSchedule) => void
}

export function RepresentativeDayScheduleSelector({
  schedule,
  onChange,
}: RepresentativeDayScheduleSelectorProps) {
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {days.map((day, index) => {
        const isOff = schedule[index] === 'OFF'

        return (
          <button
            key={day}
            type="button"
            onClick={() => {
              const newSchedule = { ...schedule }
              newSchedule[index] =
                schedule[index] === 'WORKING' ? 'OFF' : 'WORKING'
              onChange(newSchedule)
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isOff ? 'hsl(220, 10%, 92%)' : 'transparent',
              borderColor: isOff ? 'hsl(220, 10%, 75%)' : 'hsl(220, 15%, 88%)',
              color: isOff ? 'hsl(220, 15%, 25%)' : 'hsl(220, 15%, 35%)',
            }}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}
