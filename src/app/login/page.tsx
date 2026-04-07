'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true)
    const supabase = createClient()

import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (): Promise<void> => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

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
            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.9 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.1-1.5H12Z"/>
          </svg>
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Planificador</h1>
        <p className={styles.subtitle}>Sistema de gestión operativa</p>
        {error ? <p className={styles.error}>No se pudo autenticar. Intenta de nuevo.</p> : null}

        <button
          type="button"
          onClick={() => void handleLogin()}
          className={styles.button}
          disabled={loading}
        >
          <span aria-hidden="true">🔵</span>
          {loading ? 'Redirigiendo...' : 'Continuar con Google'}
        </button>
      </section>
    </main>
  )
}
