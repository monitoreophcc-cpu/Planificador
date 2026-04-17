'use client'

import React, { startTransition, useMemo, useState } from 'react'
import { BarChart3, LineChart } from 'lucide-react'
import { useAccess } from '@/hooks/useAccess'
import dynamic from 'next/dynamic'
import { type StatsTab } from './StatsTabs'
import { ReadOnlyNotice } from '@/ui/system/ReadOnlyNotice'
import {
  StatsWorkspaceHeader,
  type StatsWorkspaceMode,
} from './StatsWorkspaceHeader'

export type ExtendedStatsTab = StatsTab | 'points' | 'executive' | 'callcenter'

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
const CallCenterAnalysisView = dynamic(
  () =>
    import('@/ui/reports/analysis-beta/CallCenterAnalysisView').then(
      mod => mod.CallCenterAnalysisView
    ),
  { loading: () => <StatsPanelLoading /> }
)

export function StatsView() {
  const { isReadOnly } = useAccess()
  const [activeMode, setActiveMode] = useState<StatsWorkspaceMode>('SUMMARY')
  const [activeTab, setActiveTab] = useState<ExtendedStatsTab>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())

  const tabs = useMemo<
    Record<
      StatsWorkspaceMode,
      Array<{
        id: ExtendedStatsTab
        label: string
        description: string
        icon: React.ComponentType<{ size?: number }>
      }>
    >
  >(
    () => ({
      SUMMARY: [
        {
          id: 'monthly',
          label: 'Resumen mensual',
          description: 'KPIs, picos y ranking del mes',
          icon: BarChart3,
        },
        {
          id: 'points',
          label: 'Incidencias',
          description: 'Detalle mensual por rol y turno',
          icon: LineChart,
        },
      ],
      ANALYSIS: [
        {
          id: 'callcenter',
          label: 'Call Center',
          description: 'Lectura diaria del tablero cargado',
          icon: LineChart,
        },
        {
          id: 'executive',
          label: 'Comparativos',
          description: 'Resumen institucional y comparación',
          icon: BarChart3,
        },
      ],
    }),
    []
  )

  const visibleTabs = tabs[activeMode]

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 14px',
    cursor: 'pointer',
    border: `1px solid ${
      isActive ? 'rgba(var(--accent-rgb), 0.18)' : 'rgba(202, 189, 168, 0.3)'
    }`,
    color: isActive ? 'var(--accent-strong)' : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 600,
    background: isActive
      ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
      : 'rgba(255,255,255,0.52)',
    fontSize: '13px',
    borderRadius: '14px',
    boxShadow: isActive ? '0 10px 20px rgba(var(--accent-rgb), 0.1)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '180px',
    textAlign: 'left',
  })

  const setMode = (nextMode: StatsWorkspaceMode) => {
    startTransition(() => {
      setActiveMode(nextMode)
      setActiveTab(nextMode === 'SUMMARY' ? 'monthly' : 'callcenter')
    })
  }

  const renderTabContent = () => {
    if (activeTab === 'monthly') {
      return <MonthlySummaryView currentDate={currentDate} />
    }

    if (activeTab === 'points') {
      return <PointsReportView currentDate={currentDate} />
    }

    if (activeTab === 'callcenter') {
      return <CallCenterAnalysisView />
    }

    return <OperationalReportView />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {isReadOnly ? (
        <ReadOnlyNotice description="Puedes consultar, exportar e imprimir reportes, pero no cargar, limpiar ni reordenar datos." />
      ) : null}

      <StatsWorkspaceHeader
        mode={activeMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onModeChange={setMode}
      />

      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,242,233,0.42) 100%)',
          borderRadius: '24px',
          border: '1px solid var(--shell-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 18px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              padding: '0 0 12px',
              borderBottom: '1px solid rgba(202, 189, 168, 0.42)',
            }}
          >
            {visibleTabs.map(tab => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  type="button"
                  style={tabStyle(activeTab === tab.id)}
                  aria-pressed={activeTab === tab.id}
                  onClick={() => startTransition(() => setActiveTab(tab.id))}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color:
                        activeTab === tab.id
                          ? 'var(--text-main)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {tab.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            minHeight: '420px',
          }}
        >
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
