import type { CSSProperties } from 'react'
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react'
import type { DailyLogBulkMode } from './dailyLogTypes'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import { dailyLogSidebarStyles } from './dailyLogSidebarStyles'
import { DailyLogSidebarStatusBadge } from './DailyLogSidebarStatusBadge'

type DailyLogSidebarRepresentativeRowProps = {
  bulkMode: DailyLogBulkMode | null
  bulkSelected: boolean
  onSelectRepresentative: (representativeId: string) => void
  onToggleBulkRepresentative: (representativeId: string) => void
  row: DailyLogRepresentativeRow
  selected: boolean
}

export function DailyLogSidebarRepresentativeRow({
  bulkMode,
  bulkSelected,
  onSelectRepresentative,
  onToggleBulkRepresentative,
  row,
  selected,
}: DailyLogSidebarRepresentativeRowProps) {
  const sharedStyle = {
    ...dailyLogSidebarStyles.listItem,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...((bulkMode ? bulkSelected : selected)
      ? dailyLogSidebarStyles.activeListItem
      : {}),
    ...(row.isOperationallyAbsent ? { opacity: 0.7 } : {}),
    ...(row.isUnassigned
      ? {
          borderLeft: '4px solid var(--danger)',
          background:
            'linear-gradient(180deg, var(--bg-danger) 0%, rgba(255,255,255,0.6) 100%)',
        }
      : {}),
  } satisfies CSSProperties

  const content = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0,
        }}
      >
        {bulkMode ? (
          <input
            type="checkbox"
            checked={bulkSelected}
            onChange={() => onToggleBulkRepresentative(row.id)}
            onClick={event => event.stopPropagation()}
            style={{
              width: '16px',
              height: '16px',
              accentColor: bulkMode === 'AUSENCIA' ? 'var(--text-danger)' : 'var(--accent)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label={`Seleccionar a ${row.name} para registro por lote`}
          />
        ) : null}
        <span
          style={{
            textDecoration: row.isOperationallyAbsent ? 'line-through' : 'none',
            color: row.isOperationallyAbsent
              ? 'var(--text-muted)'
              : row.isUnassigned
                ? 'var(--text-danger)'
                : 'inherit',
            fontWeight: row.isUnassigned || bulkSelected ? 600 : 400,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.name}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {row.isUnassigned && (
          <DailyLogSidebarStatusBadge
            icon={<AlertTriangle size={10} />}
            label="Sin cobertura"
            title="Este turno debería estar cubierto pero no tiene responsable asignado"
            background="var(--bg-danger)"
            color="var(--text-danger)"
            border="1px solid var(--border-danger)"
            bold
          />
        )}

        {row.isCovered && (
          <DailyLogSidebarStatusBadge
            icon={<Shield size={10} />}
            label="Cubierto"
            title={`Cubierto por ${row.coveredByName ?? '—'}`}
            background="rgba(var(--accent-rgb), 0.08)"
            color="var(--accent-strong)"
            border="1px solid rgba(var(--accent-rgb), 0.16)"
          />
        )}

        {row.isAbsent && (
          <span
            style={{
              fontSize: '10px',
              background: 'var(--bg-danger)',
              color: 'var(--text-danger)',
              padding: '2px 6px',
              borderRadius: '999px',
              fontWeight: 600,
              border: '1px solid var(--border-danger)',
            }}
          >
            Ausente
          </span>
        )}

        {row.isCovering && (
          <DailyLogSidebarStatusBadge
            icon={<RefreshCw size={10} />}
            label="Cubriendo"
            title={`Cubriendo a ${row.coveringName ?? '—'}`}
            background="rgba(var(--accent-rgb), 0.08)"
            color="var(--accent)"
            border="1px solid rgba(var(--accent-rgb), 0.16)"
          />
        )}
      </div>
    </>
  )

  if (bulkMode) {
    return (
      <label
        style={{
          ...sharedStyle,
          cursor: 'pointer',
          gap: '10px',
        }}
      >
        {content}
      </label>
    )
  }

  return (
    <button
      onClick={() => onSelectRepresentative(row.id)}
      style={sharedStyle}
    >
      {content}
    </button>
  )
}
