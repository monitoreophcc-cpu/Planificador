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
    if (!isOnline || cloudSyncStatus === 'offline') {
      return {
        label: 'Sin conexión',
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    if (cloudSyncStatus === 'error') {
      return {
        label: 'Error de sync',
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    if (cloudSyncStatus === 'unauthenticated') {
      return {
        label: 'Inicia sesión',
        tone: '#64748b',
        surface: 'rgba(100, 116, 139, 0.12)',
      }
    }

    if (cloudSyncStatus === 'checking') {
      return {
        label: 'Verificando...',
        tone: '#475569',
        surface: 'rgba(71, 85, 105, 0.12)',
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
