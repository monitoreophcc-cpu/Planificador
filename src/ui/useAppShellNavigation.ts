'use client'

import { useEffect, useState } from 'react'
import { useAppUiStore } from '@/store/useAppUiStore'
import type { AppShellView } from './appShellTypes'

export function useAppShellNavigation() {
  const [activeView, setActiveView] = useState<AppShellView>('DAILY_LOG')

  const navigationRequest = useAppUiStore(state => state.navigationRequest)
  const clearNavigationRequest = useAppUiStore(
    state => state.clearNavigationRequest
  )

  useEffect(() => {
    if (!navigationRequest) return

    setActiveView(navigationRequest.view)
    clearNavigationRequest()
  }, [clearNavigationRequest, navigationRequest])

  return {
    activeView,
    setActiveView,
  }
}
