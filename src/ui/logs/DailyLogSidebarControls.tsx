import { Search, Shield, TriangleAlert, UserRound, UserX, X } from 'lucide-react'
import { dailyLogSidebarStyles } from './dailyLogSidebarStyles'

export type SidebarFocusMode = 'ALL' | 'ATTENTION' | 'COVERAGES' | 'ABSENT'

type DailyLogSidebarControlsProps = {
  activeCoveragesCount: number
  effectiveAdministrativeMode: boolean
  filteredCount: number
  focusMode: SidebarFocusMode
  hideAbsent: boolean
  onOpenCoverageManager: () => void
  onFocusModeChange: (mode: SidebarFocusMode) => void
  onSearchTermChange: (value: string) => void
  onToggleHideAbsent: () => void
  searchTerm: string
  totalCount: number
}

export function DailyLogSidebarControls({
  activeCoveragesCount,
  effectiveAdministrativeMode,
  filteredCount,
  focusMode,
  hideAbsent,
  onOpenCoverageManager,
  onFocusModeChange,
  onSearchTermChange,
  onToggleHideAbsent,
  searchTerm,
  totalCount,
}: DailyLogSidebarControlsProps) {
  const focusItems: Array<{
    mode: SidebarFocusMode
    label: string
    icon: typeof UserRound
  }> = [
    { mode: 'ALL', label: 'Todos', icon: UserRound },
    { mode: 'ATTENTION', label: 'Focos', icon: TriangleAlert },
    { mode: 'COVERAGES', label: 'Coberturas', icon: Shield },
    { mode: 'ABSENT', label: 'Ausentes', icon: UserX },
  ]

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
        <div>
          <label style={{ ...dailyLogSidebarStyles.label, marginBottom: 0 }}>
            Representantes del Turno
          </label>
          <div
            style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            {filteredCount === totalCount
              ? `${totalCount} ficha(s) visibles`
              : `${filteredCount} de ${totalCount} ficha(s) en esta vista`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeCoveragesCount > 0 && (
            <button
              onClick={onOpenCoverageManager}
              style={{
                background: 'rgba(239, 246, 255, 0.96)',
                border: '1px solid rgba(37, 99, 235, 0.14)',
                borderRadius: '999px',
                cursor: 'pointer',
                color: '#1e40af',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 10px',
              }}
              title="Gestionar coberturas activas"
            >
              <Shield size={12} />
              {activeCoveragesCount} activa(s)
            </button>
          )}
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

      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '0 14px',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          background: 'rgba(255,255,255,0.92)',
          marginBottom: '12px',
        }}
      >
        <Search size={16} color="#64748b" />
        <input
          type="text"
          placeholder="Buscar representante..."
          style={{
            ...dailyLogSidebarStyles.input,
            marginBottom: 0,
            border: 'none',
            padding: '12px 0',
            background: 'transparent',
          }}
          value={searchTerm}
          onChange={event => onSearchTermChange(event.target.value)}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchTermChange('')}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '999px',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'rgba(248,250,252,0.96)',
              color: '#475569',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {focusItems.map(item => {
          const Icon = item.icon
          const isActive = focusMode === item.mode

          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => onFocusModeChange(item.mode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '999px',
                border: `1px solid ${
                  isActive ? 'rgba(37, 99, 235, 0.16)' : 'rgba(148, 163, 184, 0.18)'
                }`,
                background: isActive ? 'rgba(239, 246, 255, 0.92)' : 'rgba(255,255,255,0.86)',
                color: isActive ? '#1d4ed8' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon size={13} />
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: 'var(--space-md)',
        }}
      >
        <button
          type="button"
          onClick={onToggleHideAbsent}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: hideAbsent ? '#2563eb' : '#6b7280',
            fontSize: '12px',
            fontWeight: 600,
            padding: 0,
          }}
          title="Solo afecta la vista, no el conteo"
        >
          {hideAbsent ? 'Mostrar ausentes' : 'Ocultar ausentes'}
        </button>

        {searchTerm ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Búsqueda activa
          </span>
        ) : null}
      </div>
    </>
  )
}
