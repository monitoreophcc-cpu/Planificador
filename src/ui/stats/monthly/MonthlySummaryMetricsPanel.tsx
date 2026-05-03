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
        padding: '12px 14px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,242,233,0.38) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(202, 189, 168, 0.42)',
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '10px',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(202, 189, 168, 0.42)',
          color,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
        }}
      >
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
      className="report-print-avoid-break"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
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
