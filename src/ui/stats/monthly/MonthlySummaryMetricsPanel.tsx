'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, FileText, Plane } from 'lucide-react'
import type { MonthlySummaryMetrics } from './monthlySummaryMetrics'

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
        background: 'var(--bg-panel)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={18} style={{ color }} />
        <span
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
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
        color="#2563eb"
      />
      <MetricCard
        icon={FileText}
        label="De Licencia"
        value={metrics.onLicense}
        color="#7c3aed"
      />
      <MetricCard
        icon={AlertTriangle}
        label="Agentes con ≥10 pts"
        value={metrics.atRisk}
        color="#dc2626"
      />
    </div>
  )
}
