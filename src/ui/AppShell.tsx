'use client'

import React from 'react'
import { AppShellGlobalModals } from './AppShellGlobalModals'
import { AppShellHeader } from './AppShellHeader'
import { AppShellViewRouter } from './AppShellViewRouter'
import { useAppShellNavigation } from './useAppShellNavigation'

function AppShellInner() {
  const { activeView, setActiveView } = useAppShellNavigation()

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppShellHeader activeView={activeView} onViewChange={setActiveView} />

      <main
        className="main-content app-main-shell"
        style={{
          flex: 1,
        }}
      >
        <AppShellViewRouter
          activeView={activeView}
          onNavigateToSettings={() => setActiveView('SETTINGS')}
        />
      </main>

      <AppShellGlobalModals />
    </div>
  )
}

// The main export remains the same, but AppShellInner is now connected to the store
export default function AppShellContent() {
  return (
    <AppShellInner />
  )
}
