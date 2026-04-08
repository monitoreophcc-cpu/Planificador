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
    <section
      style={{
        borderRadius: '20px',
        border: '1px solid var(--shell-border)',
        background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.45) 100%)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        style={{
          fontWeight: 'var(--font-weight-medium)',
          margin: '0 0 6px 0',
          color: 'var(--text-main)',
          fontSize: 'var(--font-size-sm)',
          letterSpacing: '-0.01em',
        }}
      >
        Estado de turnos
      </h3>
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          lineHeight: 1.5,
          color: 'var(--text-muted)',
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
          accent="var(--accent-warm)"
        />
        <ShiftStatusDisplay
          label="Noche"
          isActive={activeShift === 'NIGHT'}
          onClick={() => onActiveShiftChange('NIGHT')}
          presentCount={nightPresent}
          plannedCount={nightPlanned}
          accent="var(--accent)"
        />
      </div>
    </section>
  )
}

function ShiftStatusDisplay({
  label,
  isActive,
  onClick,
  presentCount,
  plannedCount,
  accent,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  presentCount: number
  plannedCount: number
  accent: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px',
        borderRadius: '16px',
        border:
          isActive
            ? `1px solid ${accent}`
            : '1px solid var(--shell-border)',
        background: isActive
          ? 'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.52) 100%)'
          : 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.4) 100%)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        textAlign: 'left',
        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
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
            color: isActive ? accent : 'var(--text-main)',
            fontSize: '13px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: isActive ? accent : 'var(--text-muted)',
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
            color: 'var(--text-main)',
          }}
        >
          {presentCount}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          / {plannedCount}
        </span>
      </div>
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.45,
        }}
      >
        Presentes vs planificados
      </span>
    </button>
  )
}
