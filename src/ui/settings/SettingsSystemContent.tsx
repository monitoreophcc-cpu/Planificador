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
          }}
        >
          <div>
            <h3
              style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                color: 'var(--text-main)',
              }}
            >
              Modo Edición Avanzada
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--text-muted)',
              }}
            >
              Permite modificar semanas pasadas. Usar con precaución.
            </p>
          </div>
          <button
            onClick={toggleAdvancedMode}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: isAdvancedMode ? 'var(--accent)' : '#e5e7eb',
              color: isAdvancedMode ? 'white' : '#374151',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isAdvancedMode ? 'Activado' : 'Desactivado'}
          </button>
        </div>
      </div>

      <div style={settingsViewStyles.settingItem}>
        <h3
          style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            color: 'var(--text-main)',
          }}
        >
          Historial y Auditoría
        </h3>
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Registro de acciones operativas y evidencia forense.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
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
                borderTop: '1px solid var(--border-subtle)',
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
          borderColor: '#fecaca',
          background: '#fff5f5',
        }}
      >
        <h3
          style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            color: '#991b1b',
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
            margin: '0 0 16px 0',
            fontSize: '13px',
            color: '#7f1d1d',
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
