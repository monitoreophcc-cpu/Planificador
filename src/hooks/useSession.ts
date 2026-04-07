'use client'

import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type UseSessionResult = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useSession(): UseSessionResult {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return {
    user: session?.user ?? null,
    session,
    loading,
    signOut,
  }
}
