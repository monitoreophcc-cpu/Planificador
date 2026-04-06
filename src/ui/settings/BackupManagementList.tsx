import { Trash2 } from 'lucide-react'
import {
  formatBackupDate,
  formatBackupSize,
  type BackupListEntry,
} from './backupManagementUtils'

interface BackupManagementListProps {
  backups: BackupListEntry[]
  onDeleteBackup: (key: string) => void
  onRestoreBackup: (key: string) => Promise<void>
}

export function BackupManagementList({
  backups,
  onDeleteBackup,
  onRestoreBackup,
}: BackupManagementListProps) {
  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
        Backups Guardados ({backups.length})
      </h3>

      {backups.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-muted)',
            borderRadius: '8px',
          }}
        >
          No hay backups guardados en el navegador
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {backups.map(backup => (
            <div
              key={backup.key}
              style={{
                padding: '16px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {formatBackupDate(backup.timestamp)}
                  {backup.key.includes('-auto-') && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      AUTO
                    </span>
                  )}
                  {backup.key.includes('-manual-') && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      MANUAL
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Tamaño: {formatBackupSize(backup.size)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => void onRestoreBackup(backup.key)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  Restaurar
                </button>
                <button
                  onClick={() => onDeleteBackup(backup.key)}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    color: 'var(--text-danger)',
                    border: '1px solid var(--border-danger)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
