'use client'

import { BackupManagementActions } from './BackupManagementActions'
import { BackupManagementAlerts } from './BackupManagementAlerts'
import { BackupManagementHeader } from './BackupManagementHeader'
import { BackupManagementList } from './BackupManagementList'
import { useBackupManagement } from './useBackupManagement'

export function BackupManagement() {
  const {
    autoBackup,
    backups,
    error,
    success,
    handleDeleteBackup,
    handleExport,
    handleImport,
    handleRestoreBackup,
    handleSaveBackup,
  } = useBackupManagement()

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <BackupManagementHeader
        autoBackup={autoBackup}
        onRestoreBackup={handleRestoreBackup}
      />

      <BackupManagementAlerts error={error} success={success} />

      <BackupManagementActions
        onExport={handleExport}
        onImport={handleImport}
        onSaveBackup={handleSaveBackup}
      />

      <BackupManagementList
        backups={backups}
        onDeleteBackup={handleDeleteBackup}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  )
}
