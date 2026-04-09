import type { ChangeEvent } from 'react'
import { Download, Save, Upload } from 'lucide-react'

interface BackupManagementActionsProps {
  onExport: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onSaveBackup: () => void
}

export function BackupManagementActions({
  onExport,
  onImport,
  onSaveBackup,
}: BackupManagementActionsProps) {
  const actionItems = [
    {
      key: 'export',
      title: 'Exportar estado completo',
      description:
        'Descarga un archivo JSON con el estado actual para guardarlo fuera del navegador.',
      helper: 'Ideal para mover datos o dejar una copia externa.',
      icon: Download,
      accent: '#2563eb',
      background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.85) 0%, rgba(255,255,255,0.98) 100%)',
      control: (
        <button
          onClick={onExport}
          style={{
            padding: '12px 14px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <Download size={16} />
          Exportar respaldo
        </button>
      ),
    },
    {
      key: 'import',
      title: 'Importar recuperación',
      description:
        'Carga una copia previa para restaurar el sistema desde un archivo JSON válido.',
      helper: 'Antes de importar, la app guardará una copia de recuperación local.',
      icon: Upload,
      accent: '#0f766e',
      background: 'linear-gradient(180deg, rgba(240, 253, 250, 0.86) 0%, rgba(255,255,255,0.98) 100%)',
      control: (
        <label
          style={{
            padding: '12px 14px',
            background: 'white',
            color: '#0f766e',
            border: '1px solid rgba(15, 118, 110, 0.22)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <Upload size={16} />
          Importar respaldo
          <input
            type="file"
            accept=".json"
            onChange={event => void onImport(event)}
            style={{ display: 'none' }}
          />
        </label>
      ),
    },
    {
      key: 'save',
      title: 'Crear respaldo manual',
      description:
        'Guarda una copia local adicional para tener un punto de restauración explícito.',
      helper: 'Recomendado antes de cambios grandes o pruebas delicadas.',
      icon: Save,
      accent: '#7c3aed',
      background: 'linear-gradient(180deg, rgba(245, 243, 255, 0.88) 0%, rgba(255,255,255,0.98) 100%)',
      control: (
        <button
          onClick={onSaveBackup}
          style={{
            padding: '12px 14px',
            background: 'white',
            color: '#6d28d9',
            border: '1px solid rgba(124, 58, 237, 0.22)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <Save size={16} />
          Guardar respaldo local
        </button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563eb',
            marginBottom: '8px',
          }}
        >
          Proteger y recuperar
        </div>
        <h3
          style={{
            margin: 0,
            color: 'var(--text-main)',
            fontSize: '1.12rem',
          }}
        >
          Acciones críticas del sistema
        </h3>
        <p
          style={{
            margin: '8px 0 0',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            fontSize: '14px',
          }}
        >
          Usa estas acciones para crear un punto de restauración, mover una copia
          fuera del navegador o volver a un estado seguro.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {actionItems.map(item => {
          const Icon = item.icon

          return (
            <div
              key={item.key}
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: `1px solid ${item.accent}22`,
                background: item.background,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '210px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.88)',
                  color: item.accent,
                  border: `1px solid ${item.accent}22`,
                }}
              >
                <Icon size={18} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                  }}
                >
                  {item.description}
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: item.accent,
                    fontWeight: 700,
                  }}
                >
                  {item.helper}
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>{item.control}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
