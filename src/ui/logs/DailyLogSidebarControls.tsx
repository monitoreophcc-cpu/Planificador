import type { CSSProperties } from 'react'
import type { IncidentType } from '@/domain/types'
import { Search, Shield, TriangleAlert, UserRound, UserX, X } from 'lucide-react'
import type { DailyLogBulkMode } from './dailyLogTypes'
import { dailyLogSidebarStyles } from './dailyLogSidebarStyles'

export type SidebarFocusMode = 'ALL' | 'ATTENTION' | 'COVERAGES' | 'ABSENT'

type DailyLogSidebarControlsProps = {
  activeCoveragesCount: number
  bulkMode: DailyLogBulkMode | null
  effectiveAdministrativeMode: boolean
  filteredCount: number
  focusMode: SidebarFocusMode
  hideAbsent: boolean
  incidentType: IncidentType
  onOpenCoverageManager: () => void
  onOpenBulkMode: (mode: DailyLogBulkMode) => void
  onFocusModeChange: (mode: SidebarFocusMode) => void
  onSearchTermChange: (value: string) => void
  onToggleHideAbsent: () => void
  searchTerm: string
  totalCount: number
}

export function DailyLogSidebarControls({
  activeCoveragesCount,
  bulkMode,
  effectiveAdministrativeMode,
  filteredCount,
  focusMode,
  hideAbsent,
  incidentType,
  onOpenCoverageManager,
  onOpenBulkMode,
  onFocusModeChange,
  onSearchTermChange,
  onToggleHideAbsent,
  searchTerm,
  totalCount,
}: DailyLogSidebarControlsProps) {
  const availableBulkMode =
    incidentType === 'AUSENCIA' || incidentType === 'OTRO' ? incidentType : null
  const isBulkActive = availableBulkMode !== null && bulkMode === availableBulkMode

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
              color: 'var(--text-muted)',
            }}
          >
            {filteredCount === totalCount
              ? `${totalCount} fichas visibles`
              : `${filteredCount} de ${totalCount} fichas en esta vista`}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            disabled={availableBulkMode === null}
            aria-pressed={isBulkActive}
            onClick={() => {
              if (availableBulkMode) {
                onOpenBulkMode(availableBulkMode)
              }
            }}
            style={getBulkTriggerStyle(isBulkActive, availableBulkMode === 'AUSENCIA')}
            title={
              availableBulkMode
                ? `Registrar ${availableBulkMode === 'AUSENCIA' ? 'ausencias' : 'otros'} por lote`
                : 'El lote solo está disponible para Ausencia u Otro'
            }
          >
            Lote
          </button>
          {activeCoveragesCount > 0 && (
            <button
              onClick={onOpenCoverageManager}
              style={{
                background: 'rgba(var(--accent-rgb), 0.08)',
                border: '1px solid rgba(var(--accent-rgb), 0.14)',
                borderRadius: '999px',
                cursor: 'pointer',
                color: 'var(--accent-strong)',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 10px',
                boxShadow: 'var(--shadow-sm)',
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
            color: 'var(--text-success)',
            background: 'var(--bg-success)',
            padding: '8px 10px',
            borderRadius: '12px',
            border: '1px solid var(--border-success)',
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
          borderRadius: '18px',
          border: '1px solid var(--shell-border)',
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.56) 100%)',
          marginBottom: '12px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Search size={16} color="var(--text-muted)" />
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
              border: '1px solid var(--shell-border)',
              background: 'var(--surface-raised)',
              color: 'var(--text-muted)',
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
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-strong)'}`,
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'var(--text-on-accent)' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'none',
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
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: 600,
          }}
          title="Solo afecta la vista, no el conteo"
        >
          <input
            type="checkbox"
            checked={hideAbsent}
            onChange={onToggleHideAbsent}
            style={{ accentColor: 'var(--color-primary)' }}
          />
          Ocultar ausentes
        </label>

        {searchTerm ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-faint)',
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

function getBulkTriggerStyle(
  isActive: boolean,
  isAbsenceMode: boolean | null
): CSSProperties {
  const isDisabled = isAbsenceMode === null

  return {
    border: `1px solid ${
      isActive
        ? isAbsenceMode
          ? 'var(--border-danger)'
          : 'rgba(var(--accent-rgb), 0.16)'
        : 'var(--shell-border)'
    }`,
    borderRadius: '999px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    color: isActive
      ? isAbsenceMode
        ? 'var(--text-danger)'
        : 'var(--accent-strong)'
      : isDisabled
        ? 'var(--text-faint)'
        : 'var(--text-muted)',
    fontSize: '11px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
    background: isActive
      ? isAbsenceMode
        ? 'var(--bg-danger)'
        : 'rgba(var(--accent-rgb), 0.08)'
      : isDisabled
        ? 'rgba(255,255,255,0.38)'
        : 'rgba(255,255,255,0.6)',
    letterSpacing: '0.02em',
    opacity: isDisabled ? 0.72 : 1,
  }
}
