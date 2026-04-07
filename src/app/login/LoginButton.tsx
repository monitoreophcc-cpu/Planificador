'use client'

import { useState } from 'react'
import styles from './page.module.css'

export function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (): Promise<void> => {
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogin()}
      className={styles.button}
      disabled={loading}
    >
      <span aria-hidden="true">🔵</span>
      {loading ? 'Redirigiendo...' : 'Continuar con Google'}
    </button>
  )
}
