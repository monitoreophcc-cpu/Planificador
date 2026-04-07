'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAuthError(params.get('error') === 'auth')
  }, [])

  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true)
    setInlineError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setInlineError('No se pudo iniciar la autenticación con Google.')
    }

    setLoading(false)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-app)',
        padding: 'var(--space-lg)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 420,
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-xl)',
        }}
      >
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: 'var(--font-size-xl)' }}>
          Planificador
        </h1>
        <p
          style={{
            margin: 'var(--space-sm) 0 var(--space-xl)',
            color: 'var(--text-muted)',
            fontSize: 'var(--font-size-base)',
          }}
        >
          Sistema de gestión operativa
        </p>

        {(authError || inlineError) && (
          <div
            style={{
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-danger)',
              color: 'var(--text-danger)',
              border: '1px solid var(--border-danger)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.5,
            }}
          >
            {inlineError ?? 'No se pudo completar el inicio de sesión. Inténtalo otra vez.'}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            padding: '12px 16px',
            fontWeight: 600,
            cursor: loading ? 'progress' : 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.8 12.2c0-.8-.1-1.4-.2-2H12v3.8h5.5c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3-4.4 3-7.3ZM12 22c2.7 0 5- .9 6.6-2.5l-3.4-2.5c-.9.6-2 .9-3.2.9-2.5 0-4.5-1.7-5.3-3.9H3.2v2.6A10 10 0 0 0 12 22Zm-5.3-8.1a6 6 0 0 1 0-3.8V7.5H3.2a10 10 0 0 0 0 8.9l3.5-2.5ZM12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.2 7.5L6.7 10A5.8 5.8 0 0 1 12 6Z"
            />
          </svg>
          {loading ? 'Redirigiendo...' : 'Continuar con Google'}
        </button>
      </section>
    </main>
  )
}
