'use client'

import { StatsOverviewCards } from './StatsOverviewCards'
import { StatsOverviewHeader } from './StatsOverviewHeader'
import { useStatsOverviewData } from './useStatsOverviewData'

export function StatsOverview() {
  const { monthLabel, stats, goToNextMonth, goToPreviousMonth } =
    useStatsOverviewData()

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <StatsOverviewHeader
        monthLabel={monthLabel}
        onPrev={goToPreviousMonth}
        onNext={goToNextMonth}
      />
      <StatsOverviewCards stats={stats} />
      <div
        style={{
          marginTop: '16px',
          padding: '24px',
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          color: '#4b5563',
        }}
      >
        <h3 style={{ marginTop: 0, fontWeight: 600 }}>
          Más estadísticas próximamente
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Las vistas de Carga de Trabajo y Reportes detallados están en
          desarrollo.
        </p>
      </div>
    </div>
  )
}

