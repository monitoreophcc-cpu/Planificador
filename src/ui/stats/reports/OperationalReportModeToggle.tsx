'use client'

interface OperationalReportModeToggleProps {
  mode: 'INSTITUTIONAL' | 'ANALYSIS'
  onChange: (mode: 'INSTITUTIONAL' | 'ANALYSIS') => void
}

export function OperationalReportModeToggle({
  mode,
  onChange,
}: OperationalReportModeToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '6px',
        background: 'var(--surface-tint)',
        borderRadius: '18px',
        border: '1px solid var(--shell-border)',
        width: 'fit-content',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      }}
    >
      <button
        onClick={() => onChange('INSTITUTIONAL')}
        style={{
          padding: '9px 14px',
          border: `1px solid ${mode === 'INSTITUTIONAL' ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
          borderRadius: '14px',
          background:
            mode === 'INSTITUTIONAL'
              ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
              : 'transparent',
          color: mode === 'INSTITUTIONAL' ? 'var(--accent-strong)' : 'var(--text-muted)',
          fontWeight: mode === 'INSTITUTIONAL' ? 700 : 500,
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: mode === 'INSTITUTIONAL' ? 'var(--shadow-sm)' : 'none',
        }}
      >
        ● Reporte Operativo
      </button>
      <button
        onClick={() => onChange('ANALYSIS')}
        style={{
          padding: '9px 14px',
          border: `1px solid ${mode === 'ANALYSIS' ? 'rgba(var(--accent-rgb), 0.18)' : 'transparent'}`,
          borderRadius: '14px',
          background:
            mode === 'ANALYSIS'
              ? 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.68) 100%)'
              : 'transparent',
          color: mode === 'ANALYSIS' ? 'var(--accent-strong)' : 'var(--text-muted)',
          fontWeight: mode === 'ANALYSIS' ? 700 : 500,
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: mode === 'ANALYSIS' ? 'var(--shadow-sm)' : 'none',
        }}
      >
        ○ Análisis de Períodos
      </button>
    </div>
  )
}
