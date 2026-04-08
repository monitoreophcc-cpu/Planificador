type DailyLogSidebarShiftPanelProps = {
  activeShift: 'DAY' | 'NIGHT'
  dayPlanned: number
  dayPresent: number
  nightPlanned: number
  nightPresent: number
  onActiveShiftChange: (shift: 'DAY' | 'NIGHT') => void
}

export function DailyLogSidebarShiftPanel({
  activeShift,
  dayPlanned,
  dayPresent,
  nightPlanned,
  nightPresent,
  onActiveShiftChange,
}: DailyLogSidebarShiftPanelProps) {
  return (
    <div>
      <h3
        style={{
          fontWeight: 'var(--font-weight-medium)',
          margin: '0 0 6px 0',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        Turnos
      </h3>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          lineHeight: 1.5,
          color: '#64748b',
        }}
      >
        Toca un bloque para cambiar el foco del turno.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
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
  )
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
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px',
        borderRadius: '14px',
        border:
          isActive
            ? '1px solid rgba(37, 99, 235, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.16)',
        background: isActive ? 'rgba(239, 246, 255, 0.92)' : 'rgba(255,255,255,0.9)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: isActive ? '#1e40af' : '#374151',
            fontSize: '13px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: isActive ? '#1d4ed8' : '#64748b',
            fontWeight: 700,
          }}
        >
          {isActive ? 'Activo' : 'Ver'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          {presentCount}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          / {plannedCount}
        </span>
      </div>
      <span
        style={{
          fontSize: '11px',
          color: '#64748b',
          lineHeight: 1.45,
        }}
      >
        Presentes vs planificados
      </span>
    </button>
  )
}
