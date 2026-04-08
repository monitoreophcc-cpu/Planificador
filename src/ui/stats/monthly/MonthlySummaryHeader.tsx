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
        padding: '20px',
        borderRadius: '22px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 60%, rgba(var(--accent-rgb), 0.06) 100%)',
        boxShadow: 'var(--shadow-sm)',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '8px',
          }}
        >
          Pulso mensual
        </div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Resumen Mensual de Incidencias
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onPrev}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--shell-border)',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-main)',
          }}
        >
          &lt;
        </button>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'capitalize',
            margin: 0,
            minWidth: '150px',
            textAlign: 'center',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          {monthLabel}
        </h3>
        <button
          onClick={onNext}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--shell-border)',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-main)',
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
