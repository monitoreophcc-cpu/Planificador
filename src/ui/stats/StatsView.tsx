'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { type StatsTab } from './StatsTabs'

export type ExtendedStatsTab = StatsTab | 'points' | 'executive'

function StatsPanelLoading() {
  return <div className="app-shell-loading">Cargando reporte...</div>
}

const MonthlySummaryView = dynamic(
  () => import('./monthly/MonthlySummaryView').then(mod => mod.MonthlySummaryView),
  { loading: () => <StatsPanelLoading /> }
)
const PointsReportView = dynamic(
  () => import('./reports/PointsReportView').then(mod => mod.PointsReportView),
  { loading: () => <StatsPanelLoading /> }
)
const OperationalReportView = dynamic(
  () => import('./reports/OperationalReportView').then(mod => mod.OperationalReportView),
  { loading: () => <StatsPanelLoading /> }
)

export function StatsView() {
  const [activeTab, setActiveTab] = useState<ExtendedStatsTab>('monthly')
  const tabs: { id: ExtendedStatsTab; label: string }[] = [
    { id: 'monthly', label: 'Resumen Mensual' },
    { id: 'points', label: 'Incidencias y puntos' },
    { id: 'executive', label: 'Comparativos' },
  ]

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    cursor: 'pointer',
    border: `1px solid ${isActive ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
    color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 600,
    background: isActive
      ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
      : 'transparent',
    fontSize: '14px',
    borderRadius: '16px',
    boxShadow: isActive ? '0 14px 24px rgba(var(--accent-rgb), 0.1)' : 'none',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
          borderRadius: '26px',
          border: '1px solid var(--shell-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 24px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              padding: '6px',
              borderRadius: '20px',
              border: '1px solid var(--shell-border)',
              background: 'var(--surface-tint)',
              width: 'fit-content',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                style={tabStyle(activeTab === tab.id)}
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'monthly' && <MonthlySummaryView />}
        {activeTab === 'points' && <PointsReportView />}
        {activeTab === 'executive' && <OperationalReportView />}
      </div>
    </div>
  )
}
