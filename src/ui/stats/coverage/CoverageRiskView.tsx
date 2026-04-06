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
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb',
    }}
  >
    <h2
      style={{
        fontSize: '20px',
        fontWeight: 600,
        margin: 0,
      }}
    >
      Análisis de Riesgo y Cobertura
    </h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={onPrev}
        style={{
          padding: '8px',
          border: '1px solid var(--border-strong)',
          borderRadius: '6px',
          background: 'var(--bg-panel)',
          cursor: 'pointer',
        }}
      >
        &lt;
      </button>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'capitalize',
          margin: 0,
          minWidth: '150px',
          textAlign: 'center',
        }}
      >
        {monthLabel}
      </h3>
      <button
        onClick={onNext}
        style={{
          padding: '8px',
          border: '1px solid var(--border-strong)',
          borderRadius: '6px',
          background: 'var(--bg-panel)',
          cursor: 'pointer',
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

