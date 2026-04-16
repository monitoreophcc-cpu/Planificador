'use client'

import type { CSSProperties } from 'react'
import type { RiskLevel } from '@/domain/analytics/types'

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, CSSProperties> = {
    danger: {
      backgroundColor: '#fdecea',
      color: '#b42318',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#9a6a00',
    },
    ok: {
      backgroundColor: '#e6f9ee',
      color: '#1c7c44',
    },
  }

  const labels: Record<RiskLevel, string> = {
    danger: 'REVISAR',
    warning: 'ATENCIÓN',
    ok: 'ESTABLE',
  }

  return (
    <span
      style={{
        ...styles[level],
        padding: '6px 12px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {labels[level]}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #f3f4f6',
        borderRadius: '8px',
        padding: '8px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '2px',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
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
  const formatCurrency = (value: number) =>
    `RD$ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div
      style={{
        margin: '16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <Stat label="Ausencias" value={absences} />
        <Stat label="Tardanzas" value={tardiness} />
        <Stat label="Errores" value={errors} />
        <Stat label="Puntos" value={points} />
        <Stat label="Transacciones del mes" value={transactionsCount} />
        <Stat label="Ventas (mes)" value={formatCurrency(salesAmount)} />
        <Stat label="Ticket promedio" value={formatCurrency(averageTicket)} />
      </div>
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '2px',
            fontWeight: 500,
          }}
        >
          Estado general
        </div>
        <RiskBadge level={riskLevel} />
      </div>
    </div>
  )
}
