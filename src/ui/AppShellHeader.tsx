'use client'

import type { AppShellView } from './appShellTypes'
import { AppShellHeaderBrand } from './AppShellHeaderBrand'
import { AppShellHeaderSession } from './AppShellHeaderSession'
import { AppShellHeaderTabs } from './AppShellHeaderTabs'

type AppShellHeaderProps = {
  activeView: AppShellView
  onViewChange: (view: AppShellView) => void
}

export function AppShellHeader({
  activeView,
  onViewChange,
}: AppShellHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-lg)',
        minHeight: '64px',
        padding: '0 var(--space-xl)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
      }}
    >
      <AppShellHeaderBrand />
      <AppShellHeaderTabs activeView={activeView} onViewChange={onViewChange} />
      <AppShellHeaderSession />
    </header>
  )
}
