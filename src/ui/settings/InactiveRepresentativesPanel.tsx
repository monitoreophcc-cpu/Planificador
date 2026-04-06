'use client'

import type { Representative } from '@/domain/types'

interface InactiveRepresentativesPanelProps {
  inactiveReps: Representative[]
  showInactive: boolean
  onToggle: () => void
}

export function InactiveRepresentativesPanel({
  inactiveReps,
  showInactive,
  onToggle,
}: InactiveRepresentativesPanelProps) {
  if (inactiveReps.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={onToggle}
        style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          fontWeight: 500,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {showInactive ? 'Ocultar' : 'Mostrar'} {inactiveReps.length} representantes
        inactivos
      </button>
      {showInactive && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {inactiveReps.map(rep => (
            <div
              key={rep.id}
              style={{
                padding: '12px 16px',
                background: '#f9fafb',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#9ca3af',
                fontStyle: 'italic',
              }}
            >
              {rep.name} (Inactivo)
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
