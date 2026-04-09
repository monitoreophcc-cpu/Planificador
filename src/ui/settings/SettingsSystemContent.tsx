'use client'

import { RotateCcw, Shield } from 'lucide-react'
import { TraceabilityWorkbench } from '@/ui/audit/TraceabilityWorkbench'
import { BackupManagement } from './BackupManagement'
import { QuickGuide } from './QuickGuide'
import { settingsViewStyles } from './settingsViewStyles'

type SettingsSystemContentProps = {
  handleReset: () => void
  isAdvancedMode: boolean
  toggleAdvancedMode: () => void
}

export function SettingsSystemContent({
  handleReset,
  isAdvancedMode,
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
            <div style={settingsViewStyles.sectionEyebrow}>Cambios delicados</div>
            <h3 style={settingsViewStyles.sectionTitle}>Permitir cambios en semanas pasadas</h3>
            <p style={settingsViewStyles.sectionDescription}>
              Activa esta opción solo si necesitas corregir semanas ya cerradas.
            </p>
          </div>
          <button
            onClick={toggleAdvancedMode}
            style={settingsViewStyles.toggleButton(isAdvancedMode)}
          >
            {isAdvancedMode ? 'Permitido' : 'Bloqueado'}
          </button>
        </div>
      </div>

      <div
        className="settings-system-grid__history"
        style={{ ...settingsViewStyles.settingItem, marginBottom: 0 }}
      >
        <div style={settingsViewStyles.sectionEyebrow}>Seguimiento operativo</div>
        <h3 style={settingsViewStyles.sectionTitle}>Historial y Auditoría</h3>
        <p
          style={{
            ...settingsViewStyles.sectionDescription,
            marginBottom: '18px',
          }}
        >
          Una sola vista para revisar cambios, consultar el registro del sistema y guardar semanas
          de referencia sin abrir modales ni cambiar de contexto.
        </p>
        {!isAdvancedMode && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(var(--accent-rgb), 0.12)',
              background: 'rgba(var(--accent-rgb), 0.07)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            La consulta está disponible en todo momento. Si permites cambios en semanas pasadas, podrás
            intervenir semanas pasadas con todo el historial y el detalle a la vista.
          </div>
        )}
        <div style={{ marginTop: '4px' }}>
          <TraceabilityWorkbench />
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
          Acciones delicadas
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
          Borrar cambios de la planificación
        </h3>
        <p
          style={{
            ...settingsViewStyles.sectionDescription,
            margin: '0 0 16px 0',
            color: 'var(--text-danger)',
          }}
        >
          Esta acción no se puede deshacer y puede afectar información importante.
        </p>
        <button style={settingsViewStyles.dangerButton} onClick={handleReset}>
          <RotateCcw size={16} />
          Borrar cambios de planificación
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
