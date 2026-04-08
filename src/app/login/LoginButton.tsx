'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { sanitizeNextPath } from '@/lib/auth/redirects'
import styles from './page.module.css'

export function LoginButton() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const handleLogin = async (): Promise<void> => {
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      const nextPath = sanitizeNextPath(searchParams.get('next'))

      if (nextPath !== '/') {
        callbackUrl.searchParams.set('next', nextPath)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        window.location.assign('/login?error=auth')
      }
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
