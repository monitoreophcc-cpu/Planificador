'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

function LoginPageContent() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
