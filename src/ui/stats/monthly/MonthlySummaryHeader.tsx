'use client'

interface MonthlySummaryHeaderProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
}

export function MonthlySummaryHeader({
  monthLabel,
  onPrev,
  onNext,
}: MonthlySummaryHeaderProps) {
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
        Resumen Mensual de Incidencias
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onPrev}
          style={{
            padding: '8px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            background: 'var(--bg-panel)',
            cursor: 'pointer',
          }}
        >
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
        <button
          onClick={onNext}
          style={{
            padding: '8px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            background: 'var(--bg-panel)',
            cursor: 'pointer',
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
