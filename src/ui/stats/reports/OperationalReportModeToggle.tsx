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
        padding: '4px',
        background: '#f3f4f6',
        borderRadius: '8px',
        width: 'fit-content',
      }}
    >
      <button
        onClick={() => onChange('INSTITUTIONAL')}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: mode === 'INSTITUTIONAL' ? 'white' : 'transparent',
          color: mode === 'INSTITUTIONAL' ? '#1f2937' : '#6b7280',
          fontWeight: mode === 'INSTITUTIONAL' ? 600 : 400,
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: mode === 'INSTITUTIONAL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        ● Reporte Operativo
      </button>
      <button
        onClick={() => onChange('ANALYSIS')}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: mode === 'ANALYSIS' ? 'white' : 'transparent',
          color: mode === 'ANALYSIS' ? '#1f2937' : '#6b7280',
          fontWeight: mode === 'ANALYSIS' ? 600 : 400,
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: mode === 'ANALYSIS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        ○ Análisis de Períodos
      </button>
    </div>
  )
}
