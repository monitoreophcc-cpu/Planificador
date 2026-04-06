import { AUTO_BACKUP_KEY, formatBackupDate } from './backupManagementUtils'
import type { AutoBackupMetadata } from './backupManagementUtils'

interface BackupManagementHeaderProps {
  autoBackup: AutoBackupMetadata | null
  onRestoreBackup: (key: string) => Promise<void>
}

export function BackupManagementHeader({
  autoBackup,
  onRestoreBackup,
}: BackupManagementHeaderProps) {
  return (
    <h2
      style={{
        marginTop: 0,
        marginBottom: '24px',
        color: 'var(--text-main)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      Gestión de Backups
      {autoBackup && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '13px',
              color: '#059669',
              background: '#ecfdf5',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#059669',
              }}
            />
            Auto-Backup: {formatBackupDate(autoBackup.timestamp)}
          </span>
          <button
            onClick={() => void onRestoreBackup(AUTO_BACKUP_KEY)}
            style={{
              fontSize: '12px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            title="Restaurar copia de seguridad automática"
          >
            Restaurar
          </button>
        </div>
      )}
    </h2>
  )
}
