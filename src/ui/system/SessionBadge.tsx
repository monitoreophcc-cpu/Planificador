'use client'

import { useSession } from '@/hooks/useSession'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useAppStore } from '@/store/useAppStore'
import type { CloudSyncStatus } from '@/store/useCloudSyncStore'

function syncText(status: CloudSyncStatus, online: boolean): string {
  if (!online || status === 'offline') return '🔴 Sin conexión'
  if (status === 'error') return '🔴 Error de sincronización'
  if (status === 'unauthenticated') return '⚪ Inicia sesión'
  if (status === 'checking') return '⚪ Verificando...'
  if (status === 'syncing') return '🟡 Sincronizando...'
  return '🟢 Sincronizado'
}

export function SessionBadge() {
  const { user, loading, signOut } = useSession()
  const { online } = useNetworkStatus()
  const cloudSyncStatus = useAppStore(state => state.cloudSyncStatus)

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 50 }}>
        <div
          style={{
            width: 220,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
          }}
        />
      </div>
    )
  }

  if (!user) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 50,
        display: 'flex',
        gap: 'var(--space-sm)',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '8px 10px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {user.user_metadata?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(user.user_metadata.avatar_url)}
          alt="Avatar"
          style={{ width: 30, height: 30, borderRadius: '50%' }}
        />
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)' }}>
          {String(user.user_metadata?.full_name ?? user.email ?? 'Usuario')}
        </strong>
        <small style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
          {syncText(cloudSyncStatus, online)}
        </small>
      </div>
      <button
        onClick={() => void signOut()}
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          padding: '6px 8px',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
