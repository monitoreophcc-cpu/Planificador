'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { useSession } from '@/hooks/useSession'
import { useAppShellSyncMeta } from './useAppShellSyncMeta'

export function AppShellHeaderSession() {
  const { user, loading } = useSession()
  const { isReadOnly, accessLabel } = useAccess()
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

  if (!loading && !user) {
    return (
      <div className="app-shell-session">
        <div className="app-shell-session__card app-shell-session__card--quiet">
          <div className="app-shell-session__meta">
            <p className="app-shell-session__eyebrow">Acceso</p>
            <div className="app-shell-session__status-row">
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
              <span
                className="app-shell-session__status-label"
                style={{ color: 'var(--text-main)' }}
              >
                Sesión no disponible
              </span>
            </div>
            <p className="app-shell-session__subcopy">
              Inicia sesión para activar el respaldo por usuario y mantener la nube al día.
            </p>
          </div>
        </div>

        <Link href="/login" className="app-shell-session__button">
          Entrar
        </Link>
      </div>
    )
  }

  return (
    <div className="app-shell-session">
      <div className="app-shell-session__card">
        <div className="app-shell-session__avatar">
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

        <div className="app-shell-session__meta">
          <p className="app-shell-session__eyebrow">
            {loading
              ? 'Verificando acceso'
              : isReadOnly
                ? 'Sesión activa · solo lectura'
                : 'Sesión activa'}
          </p>
          <div className="app-shell-session__name">{loading ? 'Cargando sesión...' : userName}</div>
          <div className="app-shell-session__status-row">
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
              className="app-shell-session__status-label"
              style={{
                color: syncMeta.tone,
              }}
            >
              {syncMeta.label}
            </div>
            {!loading ? (
              <div className="app-shell-session__email" title={accessLabel}>
                {accessLabel}
              </div>
            ) : null}
            {user?.email && typeof user.user_metadata?.full_name === 'string' && (
              <div className="app-shell-session__email" title={user.email}>
                {user.email}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
