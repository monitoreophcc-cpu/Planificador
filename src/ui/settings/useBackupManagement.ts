'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { buildBackupPayload } from '@/application/backup/buildBackupPayload'
import type { BackupPayload } from '@/application/backup/types'
import {
  deleteBackupFromLocalStorage,
  exportBackup,
  getAutoBackupMetadata,
  getBackupHistory,
  importBackup,
  loadBackupFromLocalStorage,
  saveBackupToLocalStorage,
} from '@/persistence/backup'
import { useCoverageStore } from '@/store/useCoverageStore'
import { useAppStore } from '@/store/useAppStore'
import {
  type AutoBackupMetadata,
  type BackupListEntry,
} from './backupManagementUtils'

interface UseBackupManagementResult {
  autoBackup: AutoBackupMetadata | null
  backups: BackupListEntry[]
  error: string | null
  success: string | null
  handleDeleteBackup: (key: string) => void
  handleExport: () => void
  handleImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleRestoreBackup: (key: string) => Promise<void>
  handleSaveBackup: () => void
}

function createPayloadFromBackupState(state: BackupPayload): BackupPayload {
  return buildBackupPayload(
    {
      ...state,
      managers: state.managers || [],
      managementSchedules: state.managementSchedules || {},
    },
    state.coverages || []
  )
}

export function useBackupManagement(): UseBackupManagementResult {
  const exportState = useAppStore(state => state.exportState)
  const importState = useAppStore(state => state.importState)
  const coverages = useCoverageStore(state => state.coverages)
  const [backups, setBackups] = useState<BackupListEntry[]>([])
  const [autoBackup, setAutoBackup] = useState<AutoBackupMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const showError = (message: string) => {
    setSuccess(null)
    setError(message)
  }

  const showSuccess = (message: string) => {
    setError(null)
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const refreshBackupList = () => {
    setBackups(getBackupHistory())
    setAutoBackup(getAutoBackupMetadata())
  }

  useEffect(() => {
    refreshBackupList()
  }, [])

  const handleExport = () => {
    try {
      exportBackup(buildBackupPayload(exportState(), coverages))
      showSuccess('Backup exportado exitosamente')
    } catch (err) {
      showError(`Error al exportar backup: ${(err as Error).message}`)
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const state = await importBackup(file)

      if (
        confirm(
          '¿Estás seguro de que deseas restaurar este backup? Esto reemplazará todos los datos actuales.'
        )
      ) {
        const result = await importState(createPayloadFromBackupState(state))
        showSuccess(result.message)
      }
    } catch (err) {
      showError(`Error al importar backup: ${(err as Error).message}`)
    }

    event.target.value = ''
  }

  const handleSaveBackup = () => {
    try {
      saveBackupToLocalStorage(buildBackupPayload(exportState(), coverages))
      refreshBackupList()
      showSuccess('Backup guardado en el navegador')
    } catch (err) {
      showError(`Error al guardar backup: ${(err as Error).message}`)
    }
  }

  const handleRestoreBackup = async (key: string) => {
    if (!confirm('¿Estás seguro de que deseas restaurar este backup?')) return

    try {
      const state = loadBackupFromLocalStorage(key)
      if (!state) {
        showError('No se pudo cargar el backup')
        return
      }

      const result = await importState(createPayloadFromBackupState(state))
      showSuccess(result.message)
    } catch (err) {
      showError(`Error al restaurar backup: ${(err as Error).message}`)
    }
  }

  const handleDeleteBackup = (key: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este backup?')) return

    try {
      deleteBackupFromLocalStorage(key)
      refreshBackupList()
      showSuccess('Backup eliminado')
    } catch (err) {
      showError(`Error al eliminar backup: ${(err as Error).message}`)
    }
  }

  return {
    autoBackup,
    backups,
    error,
    success,
    handleDeleteBackup,
    handleExport,
    handleImport,
    handleRestoreBackup,
    handleSaveBackup,
  }
}
