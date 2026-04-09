'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSyncHealthStore } from '@/store/useSyncHealthStore'

type AppShellSyncMeta = {
  label: string
  tone: string
  surface: string
}

export function useAppShellSyncMeta(): AppShellSyncMeta {
  const cloudSyncStatus = useSyncHealthStore(state => state.cloud.status)
  const pendingRows = useSyncHealthStore(state => state.cloud.pendingRows)
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
    if (cloudSyncStatus === 'unauthenticated') {
      return {
        label:
          pendingRows > 0 ? `Pendiente (${pendingRows})` : 'Inicia sesión',
        tone: pendingRows > 0 ? '#d97706' : '#64748b',
        surface:
          pendingRows > 0 ? 'rgba(217, 119, 6, 0.12)' : 'rgba(100, 116, 139, 0.12)',
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
        label:
          pendingRows > 0 ? `Sincronizando (${pendingRows})` : 'Sincronizando...',
        tone: '#d97706',
        surface: 'rgba(217, 119, 6, 0.12)',
      }
    }

    if (pendingRows > 0 && (!isOnline || cloudSyncStatus === 'offline')) {
      return {
        label: `Pendiente (${pendingRows})`,
        tone: '#d97706',
        surface: 'rgba(217, 119, 6, 0.12)',
      }
    }

    if (pendingRows > 0 && cloudSyncStatus === 'error') {
      return {
        label: `Error (${pendingRows} pendientes)`,
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    if (!isOnline || cloudSyncStatus === 'offline') {
      return {
        label: 'Sin conexión',
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    if (cloudSyncStatus === 'error') {
      return {
        label: 'Error de sincronización',
        tone: '#dc2626',
        surface: 'rgba(220, 38, 38, 0.12)',
      }
    }

    return {
      label: 'Sincronizado',
      tone: '#16a34a',
      surface: 'rgba(22, 163, 74, 0.12)',
    }
  }, [cloudSyncStatus, isOnline, pendingRows])
}
