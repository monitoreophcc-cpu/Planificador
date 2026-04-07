'use client'

import AppShellContent from '../ui/AppShell'
import { ToastProvider } from '@/ui/components/ToastProvider'
import { EditModeProvider } from '@/hooks/useEditMode'
import { useEffect, useState } from 'react'

export default function Page() {
  const [isReady, setIsReady] = useState(false)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

  useEffect(() => {
    let saveTimer: number | undefined
    let unsubscribe = () => {}
    let isActive = true

    void (async () => {
      try {
        const { useAppStore, stateToPersist } = await import('@/store/useAppStore')

        await useAppStore.getState().initialize()
        if (!isActive) return

        unsubscribe = useAppStore.subscribe(state => {
          if (state.isLoading) return
          clearTimeout(saveTimer)
          saveTimer = window.setTimeout(() => {
            void import('@/persistence/storage')
              .then(({ saveState }) => saveState(stateToPersist(useAppStore.getState())))
              .catch(error => {
                console.error('[AutoSave] No se pudo persistir el estado.', error)
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
  }, [])

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
