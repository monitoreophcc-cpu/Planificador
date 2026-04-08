'use client'

interface OperationalAnalysisReadingProps {
  reading: string
}

export function OperationalAnalysisReading({
  reading,
}: OperationalAnalysisReadingProps) {
  return (
    <div
      style={{
        padding: '18px 20px',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        border: '1px solid var(--shell-border)',
        borderRadius: '20px',
        fontSize: '14px',
        color: 'var(--text-main)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
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
        Lectura del análisis
      </div>
      <div
        style={{
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.4,
        }}
      >
        {reading}
      </div>
    </div>
  )
}
