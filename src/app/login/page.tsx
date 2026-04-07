'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleLogin = async (): Promise<void> => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Control Operativo</h1>
        <p className={styles.subtitle}>
          Inicia sesión para sincronizar tus datos entre dispositivos.
        </p>
        {error ? <p className={styles.error}>Error: {decodeURIComponent(error)}</p> : null}
        <button type="button" onClick={() => void handleLogin()} className={styles.oauthButton}>
          Continuar con Google
        </button>
      </section>
    </main>
  )
}
