'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, FileText, Plane } from 'lucide-react'
import type { MonthlySummaryMetrics } from './monthlySummaryMetrics'
import { UI_GLOSSARY } from '@/ui/copy/glossary'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: number
  color: string
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: MetricCardProps) {
  return (
    <div
      style={{
        padding: '16px',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.45) 100%)',
        borderRadius: '18px',
        border: '1px solid var(--shell-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid var(--shell-border)',
            color,
          }}
        >
          <Icon size={18} />
        </div>
        <span
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)' }}>
        {value}
      </div>
    </div>
  )
}

interface MonthlySummaryMetricsPanelProps {
  metrics: MonthlySummaryMetrics
}

export function MonthlySummaryMetricsPanel({
  metrics,
}: MonthlySummaryMetricsPanelProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}
    >
      <MetricCard
        icon={Plane}
        label="De Vacaciones"
        value={metrics.onVacation}
        color="var(--accent)"
      />
      <MetricCard
        icon={FileText}
        label="De Licencia"
        value={metrics.onLicense}
        color="var(--accent-strong)"
      />
      <MetricCard
        icon={AlertTriangle}
        label={`${UI_GLOSSARY.representative.plural} con ≥10 pts`}
        value={metrics.atRisk}
        color="var(--text-danger)"
      />
    </div>
  )
}
