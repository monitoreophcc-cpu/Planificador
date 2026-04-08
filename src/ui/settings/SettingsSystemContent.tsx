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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          ...settingsViewStyles.settingItem,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <BackupManagement />
      </div>

      <QuickGuide />

      <div style={settingsViewStyles.settingItem}>
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

      <div style={settingsViewStyles.settingItem}>
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
        style={{
          ...settingsViewStyles.settingItem,
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
    </div>
  )
}
