import type { ChangeEvent } from 'react'
import type { CSSProperties } from 'react'
import { Download, Save, Upload } from 'lucide-react'

interface BackupManagementActionsProps {
  onExport: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onSaveBackup: () => void
}

const primaryButtonStyle: CSSProperties = {
  padding: '12px 16px',
  background: 'var(--accent)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const secondaryButtonStyle: CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-panel)',
  color: 'var(--text-main)',
  border: '1px solid var(--border-strong)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

export function BackupManagementActions({
  onExport,
  onImport,
  onSaveBackup,
}: BackupManagementActionsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}
    >
      <button onClick={onExport} style={primaryButtonStyle}>
        <Download size={18} />
        Exportar Backup
      </button>

      <label style={secondaryButtonStyle}>
        <Upload size={18} />
        Importar Backup
        <input
          type="file"
          accept=".json"
          onChange={event => void onImport(event)}
          style={{ display: 'none' }}
        />
      </label>

      <button onClick={onSaveBackup} style={secondaryButtonStyle}>
        <Save size={18} />
        Guardar Backup Local
      </button>
    </div>
  )
}
