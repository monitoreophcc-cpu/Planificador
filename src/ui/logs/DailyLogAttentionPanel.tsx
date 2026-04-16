'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  DayInfo,
  Incident,
  ISODate,
  Representative,
  ShiftType,
} from '@/domain/types'
import {
  type DailyLogSummaryMetric,
  getDailyLogSummaryMetrics,
} from './dailyLogSummaryMetrics'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'

type DailyLogAttentionPanelProps = {
  activeCoveragesCount: number
  activeShift: ShiftType
  allCalendarDaysForRelevantMonths: DayInfo[]
  dailyStats: {
    dayPresent: number
    dayPlanned: number
    nightPresent: number
    nightPlanned: number
  }
  incidents: Incident[]
  logDate: ISODate
  representatives: Representative[]
  rows: DailyLogRepresentativeRow[]
}

export function DailyLogAttentionPanel({
  activeCoveragesCount,
  activeShift,
  allCalendarDaysForRelevantMonths,
  dailyStats,
  incidents,
  logDate,
  representatives,
  rows,
}: DailyLogAttentionPanelProps) {
  const metrics = getDailyLogSummaryMetrics({
    activeCoveragesCount,
    activeShift,
    allCalendarDaysForRelevantMonths,
    dailyStats,
    incidents,
    logDate,
    representativeRows: rows,
    representatives,
  })

  const friendlyDate = format(parseISO(logDate), "EEEE d 'de' MMMM", {
    locale: es,
  })

  return (
    <section
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '66ch' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
              marginBottom: '8px',
            }}
          >
            Resumen operativo
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.08rem',
              color: 'var(--text-main)',
            }}
          >
            KPIs listos para decidir antes de registrar
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            {friendlyDate.charAt(0).toUpperCase() + friendlyDate.slice(1)} · turno{' '}
            {activeShift === 'DAY' ? 'día' : 'noche'}.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <SummaryChip label={`${rows.length} fichas visibles`} />
          <SummaryChip label={`${metrics.find(metric => metric.id === 'incidents')?.value ?? '0'} incidencias`} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '10px',
        }}
      >
        {metrics.map(metric => (
          <SummaryMetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  )
}

function SummaryChip({
  label,
}: {
  label: string
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '999px',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgba(248,250,252,0.96)',
        color: '#475569',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  )
}

function SummaryMetricCard({ metric }: { metric: DailyLogSummaryMetric }) {
  const tone = getMetricTone(metric.tone)

  return (
    <section
      style={{
        padding: '16px',
        borderRadius: '18px',
        border: `1px solid ${tone.border}`,
        background: tone.background,
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '132px',
      }}
    >
      <div
        style={{
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#64748b',
        }}
      >
        {metric.title}
      </div>
      <div
        style={{
          fontSize: '2rem',
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: tone.accent,
        }}
      >
        {metric.value}
      </div>
      <p
        style={{
          margin: 0,
          marginTop: 'auto',
          fontSize: '0.84rem',
          lineHeight: 1.55,
          color: '#516277',
        }}
      >
        {metric.caption}
      </p>
    </section>
  )
}

function getMetricTone(tone: DailyLogSummaryMetric['tone']) {
  if (tone === 'danger') {
    return {
      accent: '#b91c1c',
      background: 'rgba(254, 242, 242, 0.96)',
      border: 'rgba(248, 113, 113, 0.22)',
    }
  }

  if (tone === 'warning') {
    return {
      accent: '#b45309',
      background: 'rgba(255, 251, 235, 0.96)',
      border: 'rgba(245, 158, 11, 0.22)',
    }
  }

  if (tone === 'accent') {
    return {
      accent: '#1d4ed8',
      background: 'rgba(239, 246, 255, 0.96)',
      border: 'rgba(37, 99, 235, 0.18)',
    }
  }

  return {
    accent: '#334155',
    background: 'rgba(248, 250, 252, 0.96)',
    border: 'rgba(148, 163, 184, 0.18)',
  }
}
