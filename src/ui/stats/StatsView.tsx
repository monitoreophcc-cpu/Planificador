'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { type StatsTab } from './StatsTabs'

export type ExtendedStatsTab = StatsTab | 'points' | 'executive' | 'analysis'

function StatsPanelLoading() {
  return (
    <div style={{ padding: '24px', color: 'var(--text-muted)' }}>
      Cargando reporte...
    </div>
  )
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
const CallCenterAnalysisView = dynamic(
  () => import('./reports/CallCenterAnalysisView').then(mod => mod.CallCenterAnalysisView),
  { loading: () => <StatsPanelLoading /> }
)

export function StatsView() {
  const [activeTab, setActiveTab] = useState<ExtendedStatsTab>('monthly')

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive
      ? '2px solid hsl(0, 0%, 13%)'
      : '2px solid transparent',
    color: isActive ? '#111827' : '#4b5563',
    fontWeight: isActive ? 600 : 500,
    background: 'transparent',
    fontSize: '15px',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{

          background: 'var(--bg-panel)',
          borderRadius: '12px 12px 0 0',
          padding: '0 16px',
          border: '1px solid var(--border-subtle)',
          borderBottom: 'none',
        }}
      >
        <button
          style={tabStyle(activeTab === 'monthly')}
          onClick={() => setActiveTab('monthly')}
        >
          Resumen Mensual
        </button>
        <button
          style={tabStyle(activeTab === 'points')}
          onClick={() => setActiveTab('points')}
        >
          Reporte de Puntos
        </button>
        <button
          style={tabStyle(activeTab === 'executive')}
          onClick={() => setActiveTab('executive')}
        >
          Reporte Operativo
        </button>
        <button
          style={tabStyle(activeTab === 'analysis')}
          onClick={() => setActiveTab('analysis')}
        >
          Análisis (Beta)
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-panel)',
          borderRadius: '0 0 12px 12px',
          border: '1px solid var(--border-subtle)',
          borderTop: 'none',
          minHeight: '80vh',
        }}
      >
        {activeTab === 'monthly' && <MonthlySummaryView />}
        {activeTab === 'points' && <PointsReportView />}
        {activeTab === 'executive' && <OperationalReportView />}
        {activeTab === 'analysis' && <CallCenterAnalysisView />}
      </div>
    </div>
  )
}

