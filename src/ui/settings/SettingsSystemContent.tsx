'use client'

import { History, RotateCcw, Shield } from 'lucide-react'
import { AuditPanel } from '@/ui/audit/AuditPanel'
import { BackupManagement } from './BackupManagement'
import { QuickGuide } from './QuickGuide'
import { settingsViewStyles } from './settingsViewStyles'

type SettingsSystemContentProps = {
  handleReset: () => void
  isAdvancedMode: boolean
  onShowAuditChange: (updater: (previous: boolean) => boolean) => void
  onShowHistory: () => void
  showAudit: boolean
  toggleAdvancedMode: () => void
}

export function SettingsSystemContent({
  handleReset,
  isAdvancedMode,
  onShowAuditChange,
  onShowHistory,
  showAudit,
  toggleAdvancedMode,
}: SettingsSystemContentProps) {
  return (
    <div className="settings-system-grid">
      <div
        className="settings-system-grid__backup"
        style={{
          ...settingsViewStyles.settingItem,
          padding: 0,
          overflow: 'hidden',
          marginBottom: 0,
        }}
      >
        <BackupManagement />
      </div>

      <div className="settings-system-grid__guide">
        <QuickGuide />
      </div>

      <div
        className="settings-system-grid__advanced"
        style={{ ...settingsViewStyles.settingItem, marginBottom: 0 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={settingsViewStyles.sectionEyebrow}>Edicion protegida</div>
            <h3 style={settingsViewStyles.sectionTitle}>Modo Edición Avanzada</h3>
            <p style={settingsViewStyles.sectionDescription}>
              Permite modificar semanas pasadas. Usar con precaución.
            </p>
          </div>
          <button
            onClick={toggleAdvancedMode}
            style={settingsViewStyles.toggleButton(isAdvancedMode)}
          >
            {isAdvancedMode ? 'Activado' : 'Desactivado'}
          </button>
        </div>
      </div>

      <div
        className="settings-system-grid__history"
        style={{ ...settingsViewStyles.settingItem, marginBottom: 0 }}
      >
        <div style={settingsViewStyles.sectionEyebrow}>Rastreo operativo</div>
        <h3 style={settingsViewStyles.sectionTitle}>Historial y Auditoría</h3>
        <p
          style={{
            ...settingsViewStyles.sectionDescription,
            marginBottom: '12px',
          }}
        >
          Registro de acciones operativas y evidencia forense.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              style={{
                ...settingsViewStyles.button,
                opacity: isAdvancedMode ? 1 : 0.5,
                cursor: isAdvancedMode ? 'pointer' : 'not-allowed',
              }}
              onClick={() => isAdvancedMode && onShowHistory()}
            >
              <History size={16} />
              Historial Operativo
            </button>

            <button
              style={{
                ...settingsViewStyles.button,
                opacity: isAdvancedMode ? 1 : 0.5,
                cursor: isAdvancedMode ? 'pointer' : 'not-allowed',
              }}
              onClick={() =>
                isAdvancedMode && onShowAuditChange(previous => !previous)
              }
            >
              <Shield size={16} />
              {showAudit ? 'Ocultar Auditoría Forense' : 'Auditoría Forense'}
            </button>
          </div>

          {isAdvancedMode && showAudit && (
            <div
              style={{
                marginTop: '16px',
                borderTop: '1px solid var(--shell-border)',
                paddingTop: '16px',
              }}
            >
              <AuditPanel embedded />
            </div>
          )}
        </div>
      </div>

      <div
        className="settings-system-grid__danger"
        style={{
          ...settingsViewStyles.settingItem,
          marginBottom: 0,
          borderColor: 'var(--border-danger)',
          background:
            'linear-gradient(180deg, var(--bg-danger) 0%, rgba(255,255,255,0.56) 100%)',
        }}
      >
        <div style={{ ...settingsViewStyles.sectionEyebrow, color: 'var(--text-danger)' }}>
          Acciones irreversibles
        </div>
        <h3
          style={{
            ...settingsViewStyles.sectionTitle,
            color: 'var(--text-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Shield size={18} />
          Zona de Peligro
        </h3>
        <p
          style={{
            ...settingsViewStyles.sectionDescription,
            margin: '0 0 16px 0',
            color: 'var(--text-danger)',
          }}
        >
          Estas acciones son irreversibles y pueden afectar datos importantes.
        </p>
        <button style={settingsViewStyles.dangerButton} onClick={handleReset}>
          <RotateCcw size={16} />
          Resetear Planificación
        </button>
      </div>

      <style jsx>{`
        .settings-system-grid {
          display: grid;
          gap: 24px;
          align-items: start;
        }

        @media (min-width: 1180px) {
          .settings-system-grid {
            grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.92fr);
            grid-template-areas:
              'backup guide'
              'backup advanced'
              'backup history'
              'danger history';
          }

          .settings-system-grid__backup {
            grid-area: backup;
          }

          .settings-system-grid__guide {
            grid-area: guide;
          }

          .settings-system-grid__advanced {
            grid-area: advanced;
          }

          .settings-system-grid__history {
            grid-area: history;
          }

          .settings-system-grid__danger {
            grid-area: danger;
          }
        }
      `}</style>
    </div>
  )
}
