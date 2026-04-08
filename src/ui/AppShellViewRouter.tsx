'use client'

import dynamic from 'next/dynamic'
import type { AppShellView } from './appShellTypes'

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
    eyebrow: 'Operacion diaria',
    title: 'Registro y seguimiento del dia',
    description:
      'Incidencias activas, coberturas y movimientos del equipo en una vista pensada para decidir rapido.',
    context: 'Foco operativo',
  },
  PLANNING: {
    eyebrow: 'Planificacion',
    title: 'Armado y ajuste de semanas',
    description:
      'Calendario, reglas y escenarios para preparar el equipo antes de que el dia empiece.',
    context: 'Vista de preparacion',
  },
  STATS: {
    eyebrow: 'Lectura operativa',
    title: 'Reportes y tendencias',
    description:
      'Resumenes mensuales, alertas historicas y señales para entender donde se tensiona la operacion.',
    context: 'Analisis',
  },
  SETTINGS: {
    eyebrow: 'Base del sistema',
    title: 'Configuracion y estructura',
    description:
      'Representantes, reglas, calendario y confianza del sistema en un espacio mas ordenado y guiado.',
    context: 'Espacio de control',
  },
}

export function AppShellViewRouter({
  activeView,
  onNavigateToSettings,
}: AppShellViewRouterProps) {
  const viewMeta = VIEW_META[activeView]
  const content =
    activeView === 'DAILY_LOG' ? (
      <DailyLogView />
    ) : activeView === 'PLANNING' ? (
      <PlanningSection onNavigateToSettings={onNavigateToSettings} />
    ) : activeView === 'STATS' ? (
      <StatsView />
    ) : (
      <SettingsView />
    )

  return (
    <div className="app-shell-view-frame">
      <section className="app-shell-view-banner" aria-label={`Contexto de ${viewMeta.title}`}>
        <div className="app-shell-view-banner__copy">
          <p className="app-shell-view-banner__eyebrow">{viewMeta.eyebrow}</p>
          <p className="app-shell-view-banner__title">{viewMeta.title}</p>
          <p className="app-shell-view-banner__description">{viewMeta.description}</p>
        </div>
        <div className="app-shell-view-banner__context">{viewMeta.context}</div>
      </section>
      {content}
    </div>
  )
}
