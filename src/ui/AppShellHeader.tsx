'use client'

import dynamic from 'next/dynamic'
import type { AppShellView } from './appShellTypes'
import { AppShellHeaderBrand } from './AppShellHeaderBrand'
import { AppShellHeaderTabs } from './AppShellHeaderTabs'

function SessionLoading() {
  return <div className="app-shell-session__loading" aria-hidden="true" />
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
    <header className="app-shell-header">
      <div className="app-shell-header__inner">
        <AppShellHeaderBrand />
        <AppShellHeaderTabs activeView={activeView} onViewChange={onViewChange} />
        <AppShellHeaderSession />
      </div>
    </header>
  )
}
