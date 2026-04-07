'use client'

import dynamic from 'next/dynamic'
import type { AppShellView } from './appShellTypes'
import { AppShellHeaderBrand } from './AppShellHeaderBrand'
import { AppShellHeaderTabs } from './AppShellHeaderTabs'

function SessionLoading() {
  return (
    <div
      style={{
        marginLeft: 'auto',
        minWidth: 220,
        height: 56,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background:
          'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
      }}
    />
  )
}

const AppShellHeaderSession = dynamic(
  () => import('./AppShellHeaderSession').then(mod => mod.AppShellHeaderSession),
  {
    loading: () => <SessionLoading />,
  }
)

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
