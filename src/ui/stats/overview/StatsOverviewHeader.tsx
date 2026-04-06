type StatsOverviewHeaderProps = {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
}

const navigationButtonStyle = {
  padding: '8px',
  border: '1px solid var(--border-strong)',
  borderRadius: '6px',
  background: 'var(--bg-panel)',
  cursor: 'pointer',
}

export function StatsOverviewHeader({
  monthLabel,
  onPrev,
  onNext,
}: StatsOverviewHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Visión General
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onPrev} style={navigationButtonStyle}>
          &lt;
        </button>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'capitalize',
            margin: 0,
            minWidth: '150px',
            textAlign: 'center',
          }}
        >
          {monthLabel}
        </h3>
        <button onClick={onNext} style={navigationButtonStyle}>
          &gt;
        </button>
      </div>
    </div>
  )
}
