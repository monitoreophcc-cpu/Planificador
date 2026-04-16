'use client'

import React from 'react'
import { useAccess } from '@/hooks/useAccess'
import { AppShellGlobalModals } from './AppShellGlobalModals'
import { AppShellHeader } from './AppShellHeader'
import { AppShellViewRouter } from './AppShellViewRouter'
import { useAppShellNavigation } from './useAppShellNavigation'

function AppShellInner() {
  const { activeView, setActiveView } = useAppShellNavigation()
  const { canAccessSettings } = useAccess()

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppShellHeader
        activeView={activeView}
        canAccessSettings={canAccessSettings}
        onViewChange={setActiveView}
      />

      <main
        className="main-content app-main-shell"
        style={{
          flex: 1,
        }}
      >
        <AppShellViewRouter
          activeView={activeView}
          onNavigateToSettings={() => {
            if (canAccessSettings) {
              setActiveView('SETTINGS')
            }
          }}
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
