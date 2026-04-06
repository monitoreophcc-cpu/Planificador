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
