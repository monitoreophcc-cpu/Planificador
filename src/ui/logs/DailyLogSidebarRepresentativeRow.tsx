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
              borderLeft: '4px solid #ef4444',
              backgroundColor: '#fef2f2',
            }
          : {}),
      }}
    >
      <span
        style={{
          textDecoration: row.isOperationallyAbsent ? 'line-through' : 'none',
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
          <DailyLogSidebarStatusBadge
            icon={<AlertTriangle size={10} />}
            label="DESCUBIERTO"
            title="Este turno debería estar cubierto pero no tiene responsable asignado"
            background="#fee2e2"
            color="#b91c1c"
            border="1px solid #fca5a5"
            bold
          />
        )}

        {row.isCovered && (
          <DailyLogSidebarStatusBadge
            icon={<Shield size={10} />}
            label="Cubierto"
            title={`Cubierto por ${row.coveredByName ?? '—'}`}
            background="#dbeafe"
            color="#1e40af"
          />
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
          <DailyLogSidebarStatusBadge
            icon={<RefreshCw size={10} />}
            label="Cubriendo"
            title={`Cubriendo a ${row.coveringName ?? '—'}`}
            background="#f3e8ff"
            color="#6b21a8"
          />
        )}
      </div>
    </button>
  )
}
