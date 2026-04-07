'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type SessionLike = { user: UserLike | null }
type UserLike = {
  id: string
  email?: string
  user_metadata?: { full_name?: string; avatar_url?: string }
}

type UseSessionResult = {
  user: UserLike | null
  session: SessionLike | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<SessionLike | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    void supabase.auth.getSession().then((response: { data: { session: SessionLike | null } }) => {
      setSession(response.data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, nextSession: SessionLike | null) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return useMemo(
    () => ({ user: session?.user ?? null, session, loading, signOut }),
    [loading, session, signOut]
  )
}
