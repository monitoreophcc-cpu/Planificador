import { Shield } from 'lucide-react'
import { dailyLogSidebarStyles } from './dailyLogSidebarStyles'

type DailyLogSidebarControlsProps = {
  activeCoveragesCount: number
  effectiveAdministrativeMode: boolean
  hideAbsent: boolean
  onOpenCoverageManager: () => void
  onSearchTermChange: (value: string) => void
  onToggleHideAbsent: () => void
  searchTerm: string
}

export function DailyLogSidebarControls({
  activeCoveragesCount,
  effectiveAdministrativeMode,
  hideAbsent,
  onOpenCoverageManager,
  onSearchTermChange,
  onToggleHideAbsent,
  searchTerm,
}: DailyLogSidebarControlsProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-sm)',
        }}
      >
        <label style={{ ...dailyLogSidebarStyles.label, marginBottom: 0 }}>
          Representantes del Turno
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeCoveragesCount > 0 && (
            <button
              onClick={onOpenCoverageManager}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1e40af',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Gestionar coberturas activas"
            >
              <Shield size={12} />
              {activeCoveragesCount}
            </button>
          )}

          <button
            onClick={onToggleHideAbsent}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: hideAbsent ? '#2563eb' : '#6b7280',
              fontSize: '12px',
              fontWeight: 500,
            }}
            title="Solo afecta la vista, no el conteo"
          >
            {hideAbsent ? 'Mostrar Ausentes' : 'Ocultar Ausentes'}
          </button>
        </div>
      </div>

      {effectiveAdministrativeMode && (
        <div
          style={{
            marginBottom: 'var(--space-sm)',
            fontSize: 'var(--font-size-xs)',
            color: '#059669',
            background: '#ecfdf5',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #a7f3d0',
          }}
        >
          Mostrando <strong>todos</strong> para registro administrativo.
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar representante..."
        style={{ ...dailyLogSidebarStyles.input, marginBottom: 'var(--space-md)' }}
        value={searchTerm}
        onChange={event => onSearchTermChange(event.target.value)}
      />
    </>
  )
}
