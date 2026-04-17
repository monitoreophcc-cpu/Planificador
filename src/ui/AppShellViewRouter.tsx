'use client'

import dynamic from 'next/dynamic'
import * as Popover from '@radix-ui/react-popover'
import { Info } from 'lucide-react'
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
  const shouldShowBanner =
    activeView !== 'DAILY_LOG' && activeView !== 'PLANNING'
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
    <div className="app-shell-view-frame">
      {shouldShowBanner ? (
        <section className="app-shell-view-banner" aria-label={`Contexto de ${viewMeta.title}`}>
          <div className="app-shell-view-banner__copy">
            <p className="app-shell-view-banner__eyebrow">{viewMeta.eyebrow}</p>
            <p className="app-shell-view-banner__title">{viewMeta.title}</p>
          </div>
          <div className="app-shell-view-banner__actions">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="app-shell-view-banner__summary-trigger"
                  aria-label={`Ver resumen de ${viewMeta.title}`}
                >
                  <Info size={15} strokeWidth={2.2} />
                  <span>Resumen</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="app-shell-view-popover"
                  align="end"
                  sideOffset={10}
                >
                  <p className="app-shell-view-popover__eyebrow">{viewMeta.eyebrow}</p>
                  <p className="app-shell-view-popover__title">{viewMeta.title}</p>
                  <p className="app-shell-view-popover__description">{viewMeta.description}</p>
                  <div className="app-shell-view-popover__context">{viewMeta.context}</div>
                  <Popover.Arrow className="app-shell-view-popover__arrow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <div className="app-shell-view-banner__context">{viewMeta.context}</div>
          </div>
        </section>
      ) : null}
      {content}
    </div>
  )
}
