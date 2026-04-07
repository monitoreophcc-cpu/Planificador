'use client'

import type { CSSProperties } from 'react'
import type { AppShellView } from './appShellTypes'

type AppShellHeaderTabsProps = {
  activeView: AppShellView
  onViewChange: (view: AppShellView) => void
}

const APP_SHELL_VIEWS: Array<{ id: AppShellView; label: string }> = [
  { id: 'DAILY_LOG', label: 'Registro Diario' },
  { id: 'PLANNING', label: 'Planificación' },
  { id: 'STATS', label: 'Reportes' },
  { id: 'SETTINGS', label: 'Configuración' },
]

export function AppShellHeaderTabs({
  activeView,
  onViewChange,
}: AppShellHeaderTabsProps) {
  return (
    <nav style={{ display: 'flex', height: '100%', gap: 'var(--space-sm)', flex: 1 }}>
      {APP_SHELL_VIEWS.map(view => (
        <button
          key={view.id}
          style={getViewTabStyle(activeView === view.id)}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  )
}

function getViewTabStyle(isActive: boolean): CSSProperties {
  return {
    padding: '0 var(--space-md)',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive
      ? '3px solid var(--accent)'
      : '3px solid transparent',
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 500,
    background: 'transparent',
    fontSize: 'var(--font-size-base)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
  }
}
