'use client'

import type { CSSProperties, ReactNode } from 'react'
import type { RiskLevel } from '@/domain/analytics/types'

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<
    RiskLevel,
    { dot: CSSProperties; ring: CSSProperties; label: string }
  > = {
    danger: {
      label: 'Más de 10 puntos',
      ring: {
        backgroundColor: 'var(--bg-danger)',
        border: '1px solid var(--border-danger)',
      },
      dot: {
        backgroundColor: 'var(--text-danger)',
      },
    },
    warning: {
      label: 'Entre 5 y 10 puntos',
      ring: {
        backgroundColor: 'var(--bg-warning)',
        border: '1px solid var(--border-warning)',
      },
      dot: {
        backgroundColor: 'var(--text-warning)',
      },
    },
    ok: {
      label: 'Menos de 5 puntos',
      ring: {
        backgroundColor: 'var(--bg-success)',
        border: '1px solid var(--border-success)',
      },
      dot: {
        backgroundColor: 'var(--text-success)',
      },
    },
  }

  const { dot, ring, label } = styles[level]

  return (
    <div
      title={label}
      aria-label={label}
      style={{
        ...ring,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        borderRadius: '99px',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          ...dot,
          width: '10px',
          height: '10px',
          borderRadius: '999px',
          boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.62)',
        }}
      />
    </div>
  )
}

function CurrencyValue({ amount }: { amount: number }) {
  return (
    <div style={{ display: 'grid', gap: '2px' }}>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: '#9ca3af',
        }}
      >
        RD$
      </span>
      <span
        style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#1f2937',
          lineHeight: 1.1,
          overflowWrap: 'anywhere',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      style={{
        minWidth: 0,
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '14px',
        padding: '12px',
        display: 'grid',
        gap: '8px',
        alignContent: 'space-between',
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: 700,
          letterSpacing: '0.02em',
          lineHeight: 1.35,
          minHeight: '30px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          minWidth: 0,
          fontSize: '22px',
          fontWeight: 800,
          color: '#1f2937',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          overflowWrap: 'anywhere',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  )
}

interface PersonDetailSummaryStatsProps {
  absences: number
  averageTicket: number
  errors: number
  points: number
  riskLevel: RiskLevel
  salesAmount: number
  tardiness: number
  transactionsCount: number
}

export function PersonDetailSummaryStats({
  absences,
  averageTicket,
  errors,
  points,
  riskLevel,
  salesAmount,
  tardiness,
  transactionsCount,
}: PersonDetailSummaryStatsProps) {
  const stats = [
    { label: 'Ausencias', value: absences },
    { label: 'Tardanzas', value: tardiness },
    { label: 'Errores', value: errors },
    { label: 'Puntos', value: points },
    { label: 'Transacciones del mes', value: transactionsCount },
    {
      label: 'Ventas del mes',
      value: <CurrencyValue amount={salesAmount} />,
    },
    {
      label: 'Ticket promedio',
      value: <CurrencyValue amount={averageTicket} />,
    },
  ]

  return (
    <div
      style={{
        margin: '16px 0 12px',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '0 2px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#9ca3af',
              textTransform: 'uppercase',
            }}
          >
            Resumen del mes
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Estado general
          </span>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
          gap: '10px',
          alignItems: 'stretch',
        }}
      >
        {stats.map(stat => (
          <Stat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  )
}
