'use client'

import dynamic from 'next/dynamic'
import type { AppShellView } from './appShellTypes'
import { UI_GLOSSARY } from './copy/glossary'

function ViewLoading() {
  return <div className="app-shell-loading">Cargando vista...</div>
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

const VIEW_META: Record<
  AppShellView,
  { eyebrow: string; title: string; description: string; context: string }
> = {
  DAILY_LOG: {
    eyebrow: 'Operación diaria',
    title: 'Registro y seguimiento del día',
    description:
      'Incidencias activas, coberturas y movimientos del equipo en una vista pensada para decidir rápido.',
    context: 'Foco operativo',
  },
  PLANNING: {
    eyebrow: 'Planificación',
    title: 'Armado y ajuste de semanas',
    description:
      'Calendario, reglas y escenarios para preparar el equipo antes de que el día empiece.',
    context: 'Vista de preparación',
  },
  STATS: {
    eyebrow: 'Lectura operativa',
    title: 'Reportes y tendencias',
    description:
      'Resúmenes mensuales, alertas históricas y señales para entender dónde se tensiona la operación.',
    context: 'Análisis',
  },
  SETTINGS: {
    eyebrow: 'Base del sistema',
    title: `${UI_GLOSSARY.settingsSection} y estructura`,
    description:
      'Representantes, reglas, calendario, respaldos e historial del sistema en un espacio más claro y guiado.',
    context: 'Centro de control',
  },
}

export function AppShellViewRouter({
  activeView,
  onNavigateToSettings,
}: AppShellViewRouterProps) {
  const viewMeta = VIEW_META[activeView]
  const content =
    activeView === 'DAILY_LOG' ? (
      <DailyLogView summaryMeta={viewMeta} />
    ) : activeView === 'PLANNING' ? (
      <PlanningSection onNavigateToSettings={onNavigateToSettings} />
    ) : activeView === 'STATS' ? (
      <StatsView />
    ) : (
      <SettingsView />
    )

  return (
    <div className="app-shell-view-frame">{content}</div>
  )
}
