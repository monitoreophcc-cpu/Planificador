import { AUTO_BACKUP_KEY, formatBackupDate } from './backupManagementUtils'
import type { AutoBackupMetadata } from './backupManagementUtils'

interface BackupManagementHeaderProps {
  autoBackup: AutoBackupMetadata | null
  latestManualBackupAt: string | null
  onRestoreBackup: (key: string) => Promise<void>
  savedBackupsCount: number
}

export function BackupManagementHeader({
  autoBackup,
  latestManualBackupAt,
  onRestoreBackup,
  savedBackupsCount,
}: BackupManagementHeaderProps) {
  return (
    <section
      style={{
        borderRadius: '20px',
        padding: '22px 24px',
        border: '1px solid rgba(37, 99, 235, 0.12)',
        background:
          'linear-gradient(120deg, rgba(239, 246, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 58%, rgba(240, 253, 250, 0.96) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ maxWidth: '720px' }}>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: '10px',
          }}
        >
          Centro de confianza del sistema
        </div>
        <h2
          style={{
            margin: 0,
            color: 'var(--text-main)',
            fontSize: '1.5rem',
            lineHeight: 1.15,
          }}
        >
          Estado real, protección local y recuperación en un solo lugar
        </h2>
        <p
          style={{
            margin: '12px 0 0',
            maxWidth: '62ch',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            fontSize: '0.96rem',
          }}
        >
          Aquí ves si la app está guardando en este dispositivo, si Supabase ya
          recibió los cambios y qué respaldo puedes restaurar si algo sale mal.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '16px',
          }}
        >
          {[
            `Backups guardados: ${savedBackupsCount}`,
            latestManualBackupAt
              ? `Último manual: ${formatBackupDate(latestManualBackupAt)}`
              : 'Aún no hay backup manual',
            autoBackup
              ? `Auto-backup activo`
              : 'Auto-backup pendiente',
          ].map(item => (
            <span
              key={item}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.72)',
                border: '1px solid rgba(148, 163, 184, 0.22)',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {[
          {
            title: 'Respaldo manual',
            accent: '#2563eb',
            border: '1px solid rgba(37, 99, 235, 0.18)',
            timestamp: latestManualBackupAt,
            body: latestManualBackupAt
              ? 'Conviene antes de cambios grandes, importaciones o ajustes operativos delicados.'
              : 'Todavia no hay uno guardado. Crea uno si vas a tocar algo sensible.',
          },
          {
            title: 'Respaldo automatico',
            accent: '#166534',
            border: '1px solid rgba(134, 239, 172, 0.7)',
            timestamp: autoBackup?.timestamp ?? null,
            body: autoBackup
              ? 'Sirve para volver al ultimo punto seguro automatico de este navegador.'
              : 'El sistema generara una copia automatica cuando corresponda.',
          },
        ].map(item => (
          <div
            key={item.title}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.78)',
              border: item.border,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: item.accent,
                marginBottom: '8px',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              {item.timestamp
                ? formatBackupDate(item.timestamp)
                : 'Aun sin registro'}
            </div>
            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-muted)',
              }}
            >
              {item.body}
            </div>
          </div>
        ))}

        {autoBackup ? (
          <button
            onClick={() => void onRestoreBackup(AUTO_BACKUP_KEY)}
            style={{
              padding: '11px 14px',
              background: 'white',
              border: '1px solid rgba(15, 118, 110, 0.24)',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#0f766e',
              fontWeight: 700,
            }}
            title="Restaurar copia de seguridad automática"
          >
            Restaurar auto-backup
          </button>
        ) : null}
      </div>
    </section>
  )
}
