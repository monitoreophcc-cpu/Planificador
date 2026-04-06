'use client'

import dynamic from 'next/dynamic'
import type { AppShellView } from './appShellTypes'

function ViewLoading() {
  return (
    <div style={{ padding: '24px', color: 'var(--text-muted)' }}>
      Cargando vista...
    </div>
  )
}

const DailyLogView = dynamic(
  () => import('./logs/DailyLogView').then(mod => mod.DailyLogView),
  { loading: () => <ViewLoading /> }
)
const PlanningSection = dynamic(
  () => import('./planning/PlanningSection').then(mod => mod.PlanningSection),
  { loading: () => <ViewLoading /> }
)
const StatsView = dynamic(
  () => import('./stats/StatsView').then(mod => mod.StatsView),
  { loading: () => <ViewLoading /> }
)
const SettingsView = dynamic(
  () => import('./settings/SettingsView').then(mod => mod.SettingsView),
  { loading: () => <ViewLoading /> }
)

type AppShellViewRouterProps = {
  activeView: AppShellView
  onNavigateToSettings: () => void
}

export function AppShellViewRouter({
  activeView,
  onNavigateToSettings,
}: AppShellViewRouterProps) {
  if (activeView === 'DAILY_LOG') {
    return <DailyLogView />
  }

  if (activeView === 'PLANNING') {
    return <PlanningSection onNavigateToSettings={onNavigateToSettings} />
  }

  if (activeView === 'STATS') {
    return <StatsView />
  }

  return <SettingsView />
}
