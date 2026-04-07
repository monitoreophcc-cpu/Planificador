'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useSession } from '@/hooks/useSession'
import { useAppStore } from '@/store/useAppStore'
import type { AppShellView } from './appShellTypes'

type AppShellHeaderProps = {
  activeView: AppShellView
  onViewChange: (view: AppShellView) => void
}

const APP_SHELL_VIEWS: Array<{ id: AppShellView; label: string }> = [
  { id: 'DAILY_LOG', label: 'Registro Diario' },
  { id: 'PLANNING', label: 'Planificación' },
  { id: 'STATS', label: 'Reportes' },
  { id: 'SETTINGS', label: 'Configuración' },
]

export function AppShellHeader({
  activeView,
  onViewChange,
}: AppShellHeaderProps) {
  const { user, loading, signOut } = useSession()
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

  const userName = useMemo(() => {
    if (typeof user?.user_metadata?.full_name === 'string') {
      return user.user_metadata.full_name
    }

    return user?.email ?? 'Usuario'
  }, [user])

  const userAvatar = useMemo(() => {
    return typeof user?.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : null
  }, [user])

  const syncLabel = useMemo(() => {
    if (!isOnline || cloudSyncStatus === 'offline' || cloudSyncStatus === 'error') {
      return '🔴 Sin conexión'
    }

    if (cloudSyncStatus === 'syncing') {
      return '🟡 Sincronizando...'
    }

    return '🟢 Sincronizado'
  }, [cloudSyncStatus, isOnline])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-lg)',
        minHeight: '64px',
        padding: '0 var(--space-xl)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: 'var(--text-main)' }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V3H17C18.6569 3 20 4.34315 20 6V20C20 21.6569 18.6569 23 17 23H7C5.34315 23 4 21.6569 4 20V6C4 4.34315 5.34315 3 7 3H9V2ZM15 3V4C15 4.55228 14.5523 5 14 5H10C9.44772 5 9 4.55228 9 4V3H15ZM10.2929 13.2929C9.90237 13.6834 9.2692 13.6834 8.87868 13.2929L6.70711 11.1213C6.31658 10.7308 6.31658 10.0976 6.70711 9.70711C7.09763 9.31658 7.7308 9.31658 8.12132 9.70711L9.58579 11.1716L15.8787 4.87868C16.2692 4.48816 16.9024 4.48816 17.2929 4.87868C17.6834 5.2692 17.6834 5.90237 17.2929 6.29289L10.2929 13.2929Z"
          />
        </svg>
        <span
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-main)',
          }}
        >
          Control Operativo
        </span>
      </div>

      <nav style={{ display: 'flex', height: '100%', gap: 'var(--space-sm)', flex: 1 }}>
        {APP_SHELL_VIEWS.map(view => (
          <button
            key={view.id}
            style={getViewTabStyle(activeView === view.id)}
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginLeft: 'auto',
          padding: 'var(--space-sm) 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            fontSize: 'var(--font-size-sm)',
            whiteSpace: 'nowrap',
          }}
        >
          {syncLabel}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-main)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {userAvatar ? (
              <div
                role="img"
                aria-label={userName}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url("${userAvatar}")`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
            ) : (
              <span>{userName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: 'var(--text-main)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
            >
              {loading ? 'Cargando sesión...' : userName}
            </div>
            {user?.email && (
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--font-size-xs)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 180,
                }}
              >
                {user.email}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          disabled={loading}
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            padding: '10px 14px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

function getViewTabStyle(isActive: boolean): CSSProperties {
  return {
    padding: '0 var(--space-md)',
    cursor: 'pointer',
    border: 'none',
    borderBottom: isActive
      ? '3px solid var(--accent)'
      : '3px solid transparent',
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 500,
    background: 'transparent',
    fontSize: 'var(--font-size-base)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
  }
}
