'use client'

import type { IncidentWithPoints } from '@/domain/analytics/types'
import type { DayInfo, Representative } from '@/domain/types'
import { calculatePoints } from '@/domain/analytics/computeMonthlySummary'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import { buildIncidentDisplay } from './personDetailEventListHelpers'

type PersonDetailEventItemProps = {
  allCalendarDays: DayInfo[]
  currentRepresentative: Representative
  incident: IncidentWithPoints
}

export function PersonDetailEventItem({
  allCalendarDays,
  currentRepresentative,
  incident,
}: PersonDetailEventItemProps) {
  const styleInfo = INCIDENT_STYLES[incident.type] ?? INCIDENT_STYLES.OTRO
  const eventDisplay = buildIncidentDisplay(
    incident,
    allCalendarDays,
    currentRepresentative
  )
  const points = calculatePoints(incident)

  return (
    <li
      style={{
        borderBottom: '1px solid #f3f4f6',
        padding: '12px 4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
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
            fontWeight: 500,
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor:
                styleInfo.variant === 'danger'
                  ? 'hsl(0, 100%, 97%)'
                  : styleInfo.variant === 'warning'
                    ? 'hsl(45, 100%, 96%)'
                    : 'hsl(220, 15%, 96%)',
              color:
                styleInfo.variant === 'danger'
                  ? 'hsl(0, 70%, 45%)'
                  : styleInfo.variant === 'warning'
                    ? 'hsl(45, 70%, 35%)'
                    : 'hsl(220, 10%, 40%)',
            }}
          >
            {styleInfo.label}
          </span>
          <span style={{ color: '#6b7280' }}>{eventDisplay.dateLabel}</span>
        </div>

        {eventDisplay.workingDaysInfo && (
          <p
            style={{
              fontSize: '12px',
              color: '#059669',
              margin: 0,
              paddingLeft: '8px',
              fontWeight: 500,
            }}
          >
            {eventDisplay.workingDaysInfo}
          </p>
        )}

        {incident.note && (
          <p
            style={{
              fontSize: '14px',
              color: '#374151',
              marginTop: '4px',
              paddingLeft: '8px',
              borderLeft: '3px solid var(--border-subtle)',
            }}
          >
            {incident.note}
          </p>
        )}
      </div>

      <span
        style={{
          fontWeight: 700,
          fontSize: '16px',
          color: points > 0 ? '#b91c1c' : '#374151',
        }}
      >
        {points > 0 ? `-${points}` : points}
      </span>
    </li>
  )
}
