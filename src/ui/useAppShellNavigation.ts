'use client'

import { useEffect, useState } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { useAppUiStore } from '@/store/useAppUiStore'
import type { AppShellView } from './appShellTypes'

function sanitizeView(
  view: AppShellView,
  canAccessSettings: boolean
): AppShellView {
  if (view === 'SETTINGS' && !canAccessSettings) {
    return 'DAILY_LOG'
  }

  return view
}

export function useAppShellNavigation() {
  const [activeView, setActiveView] = useState<AppShellView>('DAILY_LOG')
  const { canAccessSettings } = useAccess()

  const navigationRequest = useAppUiStore(state => state.navigationRequest)
  const clearNavigationRequest = useAppUiStore(
    state => state.clearNavigationRequest
  )

  useEffect(() => {
    if (!navigationRequest) return

    setActiveView(sanitizeView(navigationRequest.view, canAccessSettings))
    clearNavigationRequest()
  }, [canAccessSettings, clearNavigationRequest, navigationRequest])

  useEffect(() => {
    setActiveView(currentView => sanitizeView(currentView, canAccessSettings))
  }, [canAccessSettings])

  return {
    activeView,
    setActiveView,
  }
}
