'use client'

import React from 'react'
import { AppShellGlobalModals } from './AppShellGlobalModals'
import { AppShellHeader } from './AppShellHeader'
import { AppShellViewRouter } from './AppShellViewRouter'
import { useAppShellNavigation } from './useAppShellNavigation'

function AppShellInner() {
  const { activeView, setActiveView } = useAppShellNavigation()

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        background: 'var(--bg-app)',
        minHeight: '100vh',
      }}
    >
      <AppShellHeader activeView={activeView} onViewChange={setActiveView} />

      <main style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
        <AppShellViewRouter
          activeView={activeView}
          onNavigateToSettings={() => setActiveView('SETTINGS')}
        />
      </main>

      <footer
        style={{
          padding: 'var(--space-lg) 0',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-faint)',
          fontSize: 'var(--font-size-xs)',
          textAlign: 'center',
          marginTop: 'auto'
        }}
      >
      </footer>

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
