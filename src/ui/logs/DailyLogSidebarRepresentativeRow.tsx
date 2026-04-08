import { AlertTriangle, RefreshCw, Shield } from 'lucide-react'
import type { DailyLogRepresentativeRow } from './dailyLogTypes'
import { dailyLogSidebarStyles } from './dailyLogSidebarStyles'
import { DailyLogSidebarStatusBadge } from './DailyLogSidebarStatusBadge'

type DailyLogSidebarRepresentativeRowProps = {
  onSelectRepresentative: (representativeId: string) => void
  row: DailyLogRepresentativeRow
  selected: boolean
}

export function DailyLogSidebarRepresentativeRow({
  onSelectRepresentative,
  row,
  selected,
}: DailyLogSidebarRepresentativeRowProps) {
  return (
    <button
      onClick={() => onSelectRepresentative(row.id)}
      style={{
        ...dailyLogSidebarStyles.listItem,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...(selected ? dailyLogSidebarStyles.activeListItem : {}),
        ...(row.isOperationallyAbsent ? { opacity: 0.7 } : {}),
        ...(row.isUnassigned
          ? {
              borderLeft: '4px solid var(--danger)',
              background:
                'linear-gradient(180deg, var(--bg-danger) 0%, rgba(255,255,255,0.6) 100%)',
            }
          : {}),
      }}
    >
      <span
        style={{
          textDecoration: row.isOperationallyAbsent ? 'line-through' : 'none',
          color: row.isOperationallyAbsent
            ? 'var(--text-muted)'
            : row.isUnassigned
              ? 'var(--text-danger)'
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
    </button>
  )
}
