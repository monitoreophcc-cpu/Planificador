'use client'

import { BackupManagementActions } from './BackupManagementActions'
import { BackupManagementAlerts } from './BackupManagementAlerts'
import { BackupManagementHeader } from './BackupManagementHeader'
import { BackupManagementList } from './BackupManagementList'
import { SystemTrustOverview } from './SystemTrustOverview'
import { UserAccessManagementCard } from './UserAccessManagementCard'
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

  const manualBackupCount = backups.length
  const latestManualBackupAt = backups[0]?.timestamp ?? null
  const latestLocalBackupAt = backups[0]?.timestamp ?? autoBackup?.timestamp ?? null

  return (
    <div
      style={{
        padding: '24px',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background:
          'linear-gradient(180deg, rgba(244, 250, 255, 0.9) 0%, rgba(255, 255, 255, 1) 28%)',
      }}
    >
      <SystemTrustOverview latestLocalBackupAt={latestLocalBackupAt} />
      <UserAccessManagementCard />

      <BackupManagementHeader
        autoBackup={autoBackup}
        latestManualBackupAt={latestManualBackupAt}
        onRestoreBackup={handleRestoreBackup}
        savedBackupsCount={manualBackupCount}
      />

      <BackupManagementAlerts error={error} success={success} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <section
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.96)',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.06)',
            padding: '20px',
          }}
        >
          <BackupManagementActions
            onExport={handleExport}
            onImport={handleImport}
            onSaveBackup={handleSaveBackup}
          />
        </section>

        <aside
          style={{
            border: '1px solid rgba(14, 116, 144, 0.18)',
            borderRadius: '18px',
            background:
              'linear-gradient(180deg, rgba(240, 249, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0f766e',
                marginBottom: '8px',
              }}
            >
              Ruta de recuperación
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                color: 'var(--text-main)',
              }}
            >
              Qué hacer según el problema
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              {
                title: 'Antes de un cambio delicado',
                description:
                  'Crea un respaldo manual. Es tu punto seguro explícito antes de importar, limpiar o mover muchas cosas.',
              },
              {
                title: 'Si algo salió mal hoy',
                description:
                  'Prueba primero el respaldo automático. Guarda el último estado automático estable de este navegador.',
              },
              {
                title: 'Si viene de otro equipo o archivo',
                description:
                  'Usa Importar recuperación. Antes de restaurar, la app guardará un respaldo de recuperación del estado actual.',
              },
              {
                title: 'Si quieres llevarte una copia fuera del navegador',
                description:
                  'Exporta el estado completo a JSON para guardarlo aparte o moverlo a otro entorno.',
              },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.93rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '4px',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: 'var(--text-muted)',
                  }}
                >
                  {item.description}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.04)',
              border: '1px dashed rgba(148, 163, 184, 0.32)',
              color: '#475569',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            Restaurar o importar ya no te deja sin red: antes de reemplazar el
            estado actual, la app crea un respaldo de recuperación en este mismo
            navegador.
          </div>
        </aside>
      </div>

      <section
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          padding: '20px',
        }}
      >
        <BackupManagementList
          backups={backups}
          onDeleteBackup={handleDeleteBackup}
          onRestoreBackup={handleRestoreBackup}
        />
      </section>
    </div>
  )
}
