import React from 'react'
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react'
import type { IncidentType } from '@/domain/types'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'

const styles = {
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  listItem: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid transparent',
    background: 'transparent',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: '14px',
    display: 'block',
    width: '100%',
    color: '#374151',
  },
  activeListItem: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#1e40af',
    fontWeight: 600,
  },
}

function ShiftStatusDisplay({
  label,
  isActive,
  onClick,
  presentCount,
  plannedCount,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  presentCount: number
  plannedCount: number
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: isActive ? '2px solid #2563eb' : '1px solid #e5e7eb',
        background: isActive ? '#eff6ff' : 'white',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontWeight: 600,
          color: isActive ? '#1e40af' : '#374151',
        }}
      >
        {label}
      </span>
      <div style={{ textAlign: 'right' }}>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          {presentCount}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {' '}
          / {plannedCount}
        </span>
      </div>
    </div>
  )
}

type DailyLogSidebarProps = {
  activeShift: 'DAY' | 'NIGHT'
  onActiveShiftChange: (shift: 'DAY' | 'NIGHT') => void
  dayPresent: number
  dayPlanned: number
  nightPresent: number
  nightPlanned: number
  activeCoveragesCount: number
  onOpenCoverageManager: () => void
  hideAbsent: boolean
  onToggleHideAbsent: () => void
  incidentType: IncidentType
  searchTerm: string
  onSearchTermChange: (value: string) => void
  rows: DailyLogRepresentativeRow[]
  selectedRepId: string | null
  onSelectRepresentative: (representativeId: string) => void
}

export function DailyLogSidebar({
  activeShift,
  onActiveShiftChange,
  dayPresent,
  dayPlanned,
  nightPresent,
  nightPlanned,
  activeCoveragesCount,
  onOpenCoverageManager,
  hideAbsent,
  onToggleHideAbsent,
  incidentType,
  searchTerm,
  onSearchTermChange,
  rows,
  selectedRepId,
  onSelectRepresentative,
}: DailyLogSidebarProps) {
  return (
    <aside
      style={{
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 100px)',
        overflowY: 'hidden',
      }}
    >
      <div>
        <h3
          style={{
            fontWeight: 'var(--font-weight-medium)',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Estado de Turnos
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
        >
          <ShiftStatusDisplay
            label="Día"
            isActive={activeShift === 'DAY'}
            onClick={() => onActiveShiftChange('DAY')}
            presentCount={dayPresent}
            plannedCount={dayPlanned}
          />
          <ShiftStatusDisplay
            label="Noche"
            isActive={activeShift === 'NIGHT'}
            onClick={() => onActiveShiftChange('NIGHT')}
            presentCount={nightPresent}
            plannedCount={nightPlanned}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <label style={{ ...styles.label, marginBottom: 0 }}>
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

        {(incidentType === 'VACACIONES' || incidentType === 'LICENCIA') && (
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
          style={{ ...styles.input, marginBottom: 'var(--space-md)' }}
          value={searchTerm}
          onChange={event => onSearchTermChange(event.target.value)}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {rows.map(row => (
            <button
              key={row.id}
              onClick={() => onSelectRepresentative(row.id)}
              style={{
                ...styles.listItem,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...(selectedRepId === row.id ? styles.activeListItem : {}),
                ...(row.isOperationallyAbsent ? { opacity: 0.7 } : {}),
                ...(row.isUnassigned
                  ? {
                      borderLeft: '4px solid #ef4444',
                      backgroundColor: '#fef2f2',
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  textDecoration: row.isOperationallyAbsent
                    ? 'line-through'
                    : 'none',
                  color: row.isOperationallyAbsent
                    ? '#6b7280'
                    : row.isUnassigned
                      ? '#b91c1c'
                      : 'inherit',
                  fontWeight: row.isUnassigned ? 600 : 400,
                }}
              >
                {row.name}
              </span>

              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                {row.isUnassigned && (
                  <span
                    title="Este turno debería estar cubierto pero no tiene responsable asignado"
                    style={{
                      fontSize: '10px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'help',
                      border: '1px solid #fca5a5',
                    }}
                  >
                    <AlertTriangle size={10} /> DESCUBIERTO
                  </span>
                )}

                {row.isCovered && (
                  <span
                    title={`Cubierto por ${row.coveredByName ?? '—'}`}
                    style={{
                      fontSize: '10px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'help',
                    }}
                  >
                    <Shield size={10} /> Cubierto
                  </span>
                )}

                {row.isAbsent && (
                  <span
                    style={{
                      fontSize: '10px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Ausente
                  </span>
                )}

                {row.isCovering && (
                  <span
                    title={`Cubriendo a ${row.coveringName ?? '—'}`}
                    style={{
                      fontSize: '10px',
                      background: '#f3e8ff',
                      color: '#6b21a8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'help',
                    }}
                  >
                    <RefreshCw size={10} /> Cubriendo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
