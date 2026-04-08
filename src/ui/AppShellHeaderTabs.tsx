'use client'

import { BarChart3, ClipboardList, CalendarDays, SlidersHorizontal } from 'lucide-react'
import type { AppShellView } from './appShellTypes'

type AppShellHeaderTabsProps = {
  activeView: AppShellView
  onViewChange: (view: AppShellView) => void
}

const APP_SHELL_VIEWS: Array<{
  id: AppShellView
  label: string
  icon: typeof ClipboardList
}> = [
  { id: 'DAILY_LOG', label: 'Registro Diario', icon: ClipboardList },
  { id: 'PLANNING', label: 'Planificación', icon: CalendarDays },
  { id: 'STATS', label: 'Reportes', icon: BarChart3 },
  { id: 'SETTINGS', label: 'Configuración', icon: SlidersHorizontal },
]

export function AppShellHeaderTabs({
  activeView,
  onViewChange,
}: AppShellHeaderTabsProps) {
  return (
    <nav className="app-shell-nav" aria-label="Vistas principales">
      {APP_SHELL_VIEWS.map(view => {
        const Icon = view.icon
        const isActive = activeView === view.id

        return (
          <button
            key={view.id}
            type="button"
            className="app-shell-nav__tab"
            data-active={isActive}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onViewChange(view.id)}
          >
            <span className="app-shell-nav__tab-icon">
              <Icon size={15} />
            </span>
            <span className="app-shell-nav__tab-label">{view.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
