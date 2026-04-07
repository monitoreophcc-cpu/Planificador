'use client'

import { useSession } from '@/hooks/useSession'

export function SessionUserBar() {
  const { user, loading, signOut } = useSession()

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
          <img
            src={avatarUrl}
            alt={fullName ?? user.email ?? 'Usuario'}
            width={28}
            height={28}
            style={{ borderRadius: '50%' }}
          />
        ) : null}
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)' }}>
          {fullName ?? user.email}
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
