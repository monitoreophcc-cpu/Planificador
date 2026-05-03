'use client'

import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, Building2, LineChart, PhoneCall } from 'lucide-react'
import { useAccess } from '@/hooks/useAccess'
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store'
import dynamic from 'next/dynamic'
import { ReadOnlyNotice } from '@/ui/system/ReadOnlyNotice'
import {
  StatsWorkspaceHeader,
  type StatsWorkspaceReportId,
} from './StatsWorkspaceHeader'

const STATS_LAST_REPORT_KEY = 'stats:last-report'

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

function isStatsReportId(value: string | null): value is StatsWorkspaceReportId {
  return (
    value === 'monthly' ||
    value === 'points' ||
    value === 'operational' ||
    value === 'callcenter'
  )
}

export function StatsView() {
  const { isReadOnly } = useAccess()
  const dashboardHydrated = useDashboardStore(state => state._hasHydrated)
  const commercialHistoryDates = useDashboardStore(state => state.availableDates)
  const hasCommercialHistory = commercialHistoryDates.length > 0
  const [activeReport, setActiveReport] = useState<StatsWorkspaceReportId>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const hasRestoredReportRef = useRef(false)

  const reports = useMemo(
    () => [
      {
        id: 'monthly',
        label: 'Resumen mensual',
        description: 'KPIs, picos y lectura general del mes',
        icon: BarChart3,
      },
      {
        id: 'points',
        label: 'Incidencias',
        description: 'Detalle mensual por rol y turno',
        icon: LineChart,
      },
      {
        id: 'operational',
        label: 'Resumen operativo',
        description: 'Competitividad por turno y comparativos institucionales',
        icon: Building2,
      },
      {
        id: 'callcenter',
        label: 'Call Center',
        description: 'Carga, operación y gráficas del tablero de llamadas',
        icon: PhoneCall,
      },
    ] satisfies Array<{
      id: StatsWorkspaceReportId
      label: string
      description: string
      icon: React.ComponentType<{ size?: number }>
    }>,
    []
  )

  useEffect(() => {
    if (
      hasRestoredReportRef.current ||
      typeof window === 'undefined' ||
      !dashboardHydrated
    ) {
      return
    }

    const savedReport = window.localStorage.getItem(STATS_LAST_REPORT_KEY)
    const fallbackReport: StatsWorkspaceReportId = hasCommercialHistory
      ? 'operational'
      : 'monthly'

    setActiveReport(isStatsReportId(savedReport) ? savedReport : fallbackReport)
    hasRestoredReportRef.current = true
  }, [dashboardHydrated, hasCommercialHistory])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasRestoredReportRef.current) {
      return
    }

    window.localStorage.setItem(STATS_LAST_REPORT_KEY, activeReport)
  }, [activeReport])

  const showMonthControls = activeReport === 'monthly' || activeReport === 'points'

  const renderReport = () => {
    if (activeReport === 'monthly') {
      return <MonthlySummaryView currentDate={currentDate} />
    }

    if (activeReport === 'points') {
      return <PointsReportView currentDate={currentDate} />
    }

    if (activeReport === 'callcenter') {
      return <CallCenterAnalysisView />
    }

    return (
      <OperationalReportView
        onOpenCallCenter={() => startTransition(() => setActiveReport('callcenter'))}
      />
    )
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
        <div className="report-screen-only">
          <ReadOnlyNotice description="Puedes consultar, exportar e imprimir reportes, pero no cargar, limpiar ni reordenar datos." />
        </div>
      ) : null}

      <StatsWorkspaceHeader
        activeReport={activeReport}
        reports={reports}
        currentDate={currentDate}
        showMonthControls={showMonthControls}
        onDateChange={setCurrentDate}
        onReportChange={report => startTransition(() => setActiveReport(report))}
      />

      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,242,233,0.42) 100%)',
          borderRadius: '24px',
          border: '1px solid var(--shell-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          minHeight: '420px',
        }}
      >
        {renderReport()}
      </div>
    </div>
  )
}
