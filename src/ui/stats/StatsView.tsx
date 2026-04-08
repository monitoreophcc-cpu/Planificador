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
  const activeMeta =
    activeTab === 'monthly'
      ? {
          eyebrow: 'Lectura mensual',
          title: 'Resumen, tendencias y focos de incidencia',
          description:
            'Una vista para entender rápidamente dónde se está tensionando la operación y qué personas necesitan atención.',
        }
      : activeTab === 'points'
        ? {
            eyebrow: 'Disciplina operativa',
            title: 'Puntos e incidencias punitivas',
            description:
              'Seguimiento mensual por rol y turno para leer acumulados sin perder claridad.',
          }
        : {
            eyebrow: 'Lectura institucional',
            title: 'Riesgo, desempeño y análisis comparativo',
            description:
              'Reportes ejecutivos y análisis de períodos para entender el comportamiento operativo con más contexto.',
          }

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '11px 16px',
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
        gap: '22px',
      }}
    >
      <section
        style={{
          borderRadius: '26px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 58%, rgba(var(--accent-rgb), 0.08) 100%)',
          boxShadow: 'var(--shadow-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(var(--accent-rgb), 0.16)',
              background: 'rgba(var(--accent-rgb), 0.08)',
              color: 'var(--accent-strong)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {activeMeta.eyebrow}
          </div>
          <h2
            style={{
              margin: '12px 0 0',
              fontSize: '1.55rem',
              lineHeight: 1.08,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
            }}
          >
            Reportes
          </h2>
          <p
            style={{
              margin: '10px 0 0',
              maxWidth: '68ch',
              color: 'var(--text-muted)',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
          >
            {activeMeta.description}
          </p>
        </div>

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
        </div>
      </section>

      <div
        style={{
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
          borderRadius: '26px',
          border: '1px solid var(--shell-border)',
          minHeight: '80vh',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {activeTab === 'monthly' && <MonthlySummaryView />}
        {activeTab === 'points' && <PointsReportView />}
        {activeTab === 'executive' && <OperationalReportView />}
      </div>
    </div>
  )
}

