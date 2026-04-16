'use client'

import AppShellContent from '../ui/AppShell'
import { ToastProvider } from '@/ui/components/ToastProvider'
import { useAccess } from '@/hooks/useAccess'
import { EditModeProvider } from '@/hooks/useEditMode'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { buildNextPath } from '@/lib/auth/redirects'
import { useSession } from '@/hooks/useSession'
import { useAccessStore } from '@/store/useAccessStore'
import { useSyncHealthStore } from '@/store/useSyncHealthStore'

export default function Page() {
  const { user, loading: sessionLoading, signOut } = useSession()
  const { error: accessError, hasAuthenticatedAppAccess, status: accessStatus } =
    useAccess()
  const userId = user?.id ?? null
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const bootstrapAuthenticatedAccess = useAccessStore(
    state => state.bootstrapAuthenticatedAccess
  )
  const clearAccess = useAccessStore(state => state.clearAccess)

  useEffect(() => {
    if (sessionLoading || userId) {
      return
    }

    clearAccess()
    const search =
      typeof window === 'undefined' ? '' : window.location.search
    const nextPath = buildNextPath(pathname, search)
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
  }, [clearAccess, pathname, router, sessionLoading, userId])

  useEffect(() => {
    if (sessionLoading) {
      return
    }

    if (!userId) {
      setIsReady(false)
      return
    }

    let isActive = true

    setIsReady(false)
    setBootstrapError(null)

    void bootstrapAuthenticatedAccess(userId).catch(error => {
      if (!isActive) return

      setBootstrapError(
        error instanceof Error
          ? error.message
          : 'No se pudo validar el acceso de esta cuenta.'
      )
    })

    return () => {
      isActive = false
    }
  }, [bootstrapAuthenticatedAccess, sessionLoading, userId])

  useEffect(() => {
    if (
      sessionLoading ||
      !userId ||
      accessStatus !== 'ready' ||
      !hasAuthenticatedAppAccess
    ) {
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
  }, [accessStatus, hasAuthenticatedAppAccess, sessionLoading, userId])

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

  if (!userId) {
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

  if (accessStatus === 'loading') {
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
        Validando acceso...
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

  if (accessStatus === 'error') {
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
            No se pudo validar el acceso
          </h1>
          <p style={{ margin: '12px 0 0', color: '#4b5563', lineHeight: 1.5 }}>
            {accessError ?? 'Ocurrió un error inesperado al revisar los permisos.'}
          </p>
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

  if (accessStatus === 'ready' && !hasAuthenticatedAppAccess) {
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
            maxWidth: '560px',
            width: '100%',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
            Tu cuenta no tiene acceso a esta operación
          </h1>
          <p style={{ margin: '12px 0 0', color: '#4b5563', lineHeight: 1.6 }}>
            {accessError ??
              'Solo el usuario principal y las cuentas de solo lectura habilitadas pueden entrar a la plataforma.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#111827',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
            <button
              onClick={() => {
                void signOut()
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar sesión
            </button>
          </div>
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
