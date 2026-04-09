'use client'

import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type UseSessionResult = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

function createClientSafely() {
  try {
    return createClient()
  } catch (error) {
    console.warn(
      '[Auth] Supabase no esta configurado en este entorno; se omite la inicializacion de sesion.',
      error
    )

    return null
  }
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const supabase = createClientSafely()

    if (!supabase) {
      setLoading(false)
      return () => {
        isMounted = false
      }
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return

        setSession(data.session)
        setLoading(false)
      })
      .catch(error => {
        console.error('[Auth] No se pudo recuperar la sesion actual.', error)
        if (!isMounted) return
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async (): Promise<void> => {
    try {
      const supabase = createClientSafely()

      if (supabase) {
        await supabase.auth.signOut()
      }
    } finally {
      router.push('/login')
    }
  }

  return {
    user: session?.user ?? null,
    session,
    loading,
    signOut,
  }
}
