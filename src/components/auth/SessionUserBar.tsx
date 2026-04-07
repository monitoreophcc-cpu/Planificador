'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useSession } from '@/hooks/useSession'
import { useCloudSyncStore } from '@/store/useCloudSyncStore'

export function SessionUserBar() {
  const { user, loading, signOut } = useSession()
  const syncStatus = useCloudSyncStore(state => state.status)
  const setSyncStatus = useCloudSyncStore(state => state.setStatus)

  useEffect(() => {
    const onOnline = () => setSyncStatus('syncing')
    const onOffline = () => setSyncStatus('offline')

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setSyncStatus])

  if (loading) {
    return (
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            height: 20,
            width: 180,
            background: 'var(--bg-hover)',
            borderRadius: 999,
            animation: 'pulse 1.2s ease-in-out infinite',
          }}
        />
      </div>
    )
  }

  if (!user) return null

  const fullName = user.user_metadata.full_name as string | undefined
  const avatarUrl = user.user_metadata.avatar_url as string | undefined
  const syncLabel =
    syncStatus === 'checking'
      ? '⚪ Verificando...'
      : syncStatus === 'syncing'
      ? '🟡 Sincronizando...'
      : syncStatus === 'unauthenticated'
        ? '⚪ Inicia sesión'
      : syncStatus === 'offline'
        ? '🔴 Sin conexión'
        : syncStatus === 'error'
          ? '🔴 Error de sync'
          : '🟢 Sincronizado'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName ?? user.email ?? 'Usuario'}
            width={28}
            height={28}
            unoptimized
            style={{ borderRadius: '50%' }}
          />
        ) : null}
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)' }}>
          {fullName ?? user.email}
        </span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {syncLabel}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        style={{
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 10px',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
