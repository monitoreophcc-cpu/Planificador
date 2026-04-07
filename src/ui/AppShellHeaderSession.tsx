'use client'

import { useMemo } from 'react'
import { useSession } from '@/hooks/useSession'
import { useAppShellSyncMeta } from './useAppShellSyncMeta'

export function AppShellHeaderSession() {
  const { user, loading, signOut } = useSession()
  const syncMeta = useAppShellSyncMeta()

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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginLeft: 'auto',
        padding: 'var(--space-sm) 0',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          minWidth: 0,
          padding: '10px 12px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
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
              fontSize: '0.95rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 180,
            }}
          >
            {loading ? 'Cargando sesión...' : userName}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
              minWidth: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '999px',
                background: syncMeta.tone,
                boxShadow: `0 0 0 4px ${syncMeta.surface}`,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                color: syncMeta.tone,
                fontSize: 'var(--font-size-xs)',
                whiteSpace: 'nowrap',
                fontWeight: 600,
              }}
            >
              {syncMeta.label}
            </div>
            {user?.email && typeof user.user_metadata?.full_name === 'string' && (
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 'var(--font-size-xs)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 160,
                }}
                title={user.email}
              >
                {user.email}
              </div>
            )}
          </div>
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
          padding: '10px 12px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Salir
      </button>
    </div>
  )
}
