import { Trash2 } from 'lucide-react'
import {
  describeBackupKind,
  formatBackupDate,
  formatBackupKindLabel,
  formatBackupSize,
  formatBackupSummary,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0f766e',
              marginBottom: '8px',
            }}
          >
            Respaldo y recuperación
          </div>
          <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.12rem' }}>
            Backups guardados ({backups.length})
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              fontSize: '14px',
              maxWidth: '58ch',
            }}
          >
            Cada backup es un punto de restauración independiente. Úsalos para volver
            atrás si una importación, cambio masivo o ajuste operativo no sale como esperabas.
          </p>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(248, 250, 252, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Antes de restaurar, la app crea un respaldo de recuperación del estado actual.
        </div>
      </div>

      {backups.length === 0 ? (
        <div
          style={{
            padding: '42px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background:
              'linear-gradient(180deg, rgba(248, 250, 252, 0.88) 0%, rgba(255,255,255,0.98) 100%)',
            borderRadius: '16px',
            border: '1px dashed rgba(148, 163, 184, 0.4)',
          }}
        >
          No hay backups guardados en el navegador. Crea uno manual para tener un
          punto de restauración explícito.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px',
          }}
        >
          {backups.map(backup => (
            <div
              key={backup.key}
              style={{
                padding: '16px 18px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                gap: '12px',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
                minHeight: '100%',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {formatBackupDate(backup.timestamp)}
                  <span
                    style={{
                      fontSize: '10px',
                      background:
                        backup.kind === 'recovery'
                          ? '#ede9fe'
                          : backup.kind === 'manual'
                            ? '#eff6ff'
                            : '#dcfce7',
                      color:
                        backup.kind === 'recovery'
                          ? '#6d28d9'
                          : backup.kind === 'manual'
                            ? '#374151'
                            : '#166534',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {formatBackupKindLabel(backup.kind)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>Tamaño: {formatBackupSize(backup.size)}</span>
                  {backup.exportedAt ? (
                    <span>Exportado: {formatBackupDate(backup.exportedAt)}</span>
                  ) : null}
                  {backup.domainVersion ? (
                    <span>Modelo: v{backup.domainVersion}</span>
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: '#475569',
                  }}
                >
                  {describeBackupKind(backup.kind)}
                </div>
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {formatBackupSummary(backup.summary).map(item => (
                    <span
                      key={`${backup.key}-${item}`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '999px',
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => void onRestoreBackup(backup.key)}
                  style={{
                    padding: '10px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '13px',
                    flex: '1 1 140px',
                  }}
                >
                  Restaurar
                </button>
                <button
                  onClick={() => onDeleteBackup(backup.key)}
                  style={{
                    padding: '10px 12px',
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid rgba(220, 38, 38, 0.24)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '44px',
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
