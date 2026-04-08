'use client'

import React from 'react'
import { CoverageRiskDeficitSection } from './CoverageRiskDeficitSection'
import { CoverageRiskSummaryCards } from './CoverageRiskSummaryCards'
import { useCoverageRiskViewData } from './useCoverageRiskViewData'

const RiskHeader = ({
  monthLabel,
  onPrev,
  onNext,
}: {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      borderRadius: '22px',
      border: '1px solid var(--shell-border)',
      background:
        'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 60%, rgba(var(--accent-rgb), 0.06) 100%)',
      boxShadow: 'var(--shadow-sm)',
      gap: '16px',
      flexWrap: 'wrap',
    }}
  >
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '8px',
        }}
      >
        Cobertura mensual
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          margin: 0,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
        }}
      >
        Análisis de Riesgo y Cobertura
      </h2>
      <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
        Detecta huecos críticos y días que requieren refuerzo operativo.
      </p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={onPrev}
        style={{
          padding: '8px 10px',
          border: '1px solid var(--shell-border)',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-main)',
        }}
      >
        &lt;
      </button>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'capitalize',
          margin: 0,
          minWidth: '150px',
          textAlign: 'center',
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
        }}
      >
        {monthLabel}
      </h3>
      <button
        onClick={onNext}
        style={{
          padding: '8px 10px',
          border: '1px solid var(--shell-border)',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-main)',
        }}
      >
        &gt;
      </button>
    </div>
  </div>
)

export function CoverageRiskView() {
  const { monthLabel, riskSummary, goToNextMonth, goToPreviousMonth } =
    useCoverageRiskViewData()

  if (!riskSummary) {
    return <div style={{ padding: '24px' }}>Cargando resumen de riesgo...</div>
  }

  const {
    daysWithDeficit,
    criticalDeficitDays,
    totalDeficit,
    worstShift,
    dailyDeficits,
  } = riskSummary

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)',
      }}
    >
      <RiskHeader
        monthLabel={monthLabel}
        onPrev={goToPreviousMonth}
        onNext={goToNextMonth}
      />
      <CoverageRiskSummaryCards
        criticalDeficitDays={criticalDeficitDays}
        daysWithDeficit={daysWithDeficit}
        totalDays={riskSummary.totalDays}
        totalDeficit={totalDeficit}
        worstShift={worstShift}
      />

      <CoverageRiskDeficitSection dailyDeficits={dailyDeficits} />
    </div>
  )
}

