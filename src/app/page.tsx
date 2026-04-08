'use client'

import AppShellContent from '../ui/AppShell'
import { ToastProvider } from '@/ui/components/ToastProvider'
import { EditModeProvider } from '@/hooks/useEditMode'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { buildNextPath } from '@/lib/auth/redirects'
import { useSession } from '@/hooks/useSession'
import { useSyncHealthStore } from '@/store/useSyncHealthStore'

export default function Page() {
  const { user, loading: sessionLoading } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionLoading || user) {
      return
    }

    const search =
      typeof window === 'undefined' ? '' : window.location.search
    const nextPath = buildNextPath(pathname, search)
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
  }, [pathname, router, sessionLoading, user])

  useEffect(() => {
    if (sessionLoading || !user) {
      return
    }

    let saveTimer: number | undefined
    let unsubscribe = () => {}
    let isActive = true
    let lastPersistedSignature = ''

    void (async () => {
      try {
        const { useAppStore, stateToPersist } = await import('@/store/useAppStore')
        const syncHealth = useSyncHealthStore.getState()

        await useAppStore.getState().initialize()
        if (!isActive) return

        syncHealth.markLocalReady()
        lastPersistedSignature = JSON.stringify(
          stateToPersist(useAppStore.getState())
        )

        unsubscribe = useAppStore.subscribe(state => {
          if (state.isLoading) return

          const persistedState = stateToPersist(useAppStore.getState())
          const nextPersistedSignature = JSON.stringify(persistedState)

          if (nextPersistedSignature === lastPersistedSignature) {
            return
          }

          lastPersistedSignature = nextPersistedSignature
          syncHealth.markLocalPending()

          clearTimeout(saveTimer)
          saveTimer = window.setTimeout(() => {
            syncHealth.markLocalSaving()
            void import('@/persistence/storage')
              .then(({ saveState }) => saveState(persistedState))
              .then(() => {
                syncHealth.markLocalSaved()
              })
              .catch(error => {
                console.error('[AutoSave] No se pudo persistir el estado.', error)
                syncHealth.markLocalError(
                  error instanceof Error
                    ? error.message
                    : 'No se pudo guardar en este dispositivo.'
                )
              })
          }, 300)
        })

        setIsReady(true)

        void import('@/persistence/backup')
          .then(async ({ shouldRunAutoBackup, saveBackupToLocalStorage }) => {
            if (!isActive || !shouldRunAutoBackup()) return
            const { useCoverageStore } = await import('@/store/useCoverageStore')
            const { buildBackupPayload } = await import('@/application/backup/buildBackupPayload')
            saveBackupToLocalStorage(
              buildBackupPayload(
                stateToPersist(useAppStore.getState()),
                useCoverageStore.getState().coverages
              ),
              'auto'
            )
          })
          .catch(error => {
            console.error('[Backup] No se pudo ejecutar el auto-backup.', error)
          })
      } catch (error) {
        console.error('[Bootstrap] No se pudo inicializar la aplicación.', error)
        if (!isActive) return
        setBootstrapError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al cargar la aplicación.'
        )
      }
    })()

    return () => {
      isActive = false
      clearTimeout(saveTimer)
      unsubscribe()
    }
  }, [sessionLoading, user])

  if (sessionLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '1.2rem',
          color: '#6b7280',
        }}
      >
        Verificando sesión...
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '1.1rem',
          color: '#6b7280',
        }}
      >
        Redirigiendo al login...
      </div>
    )
  }

  if (bootstrapError) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          background: '#f8fafc',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
            No se pudo cargar la aplicación
          </h1>
          <p style={{ margin: '12px 0 0', color: '#4b5563', lineHeight: 1.5 }}>{bootstrapError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
          fontSize: '1.2rem',
          color: '#6b7280',
        }}
      >
        Cargando estado de la aplicación...
      </div>
    )
  }

  return (
    <ToastProvider>
      <EditModeProvider>
        <AppShellContent />
      </EditModeProvider>
    </ToastProvider>
  )
}
