'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

type AppShellSyncMeta = {
  label: string
  tone: string
  surface: string
}

export function useAppShellSyncMeta(): AppShellSyncMeta {
  const cloudSyncStatus = useAppStore(state => state.cloudSyncStatus)
  const [isOnline, setIsOnline] = useState(
    typeof window === 'undefined' ? true : window.navigator.onLine
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return useMemo(() => {
    if (!isOnline || cloudSyncStatus === 'offline' || cloudSyncStatus === 'error') {
      return {
        label: 'Sin conexión',
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    if (cloudSyncStatus === 'syncing') {
      return {
        label: 'Sincronizando...',
        tone: '#d97706',
        surface: 'rgba(217, 119, 6, 0.12)',
      }
    }

    return {
      label: 'Sincronizado',
      tone: '#16a34a',
      surface: 'rgba(22, 163, 74, 0.12)',
    }
  }, [cloudSyncStatus, isOnline])
}
