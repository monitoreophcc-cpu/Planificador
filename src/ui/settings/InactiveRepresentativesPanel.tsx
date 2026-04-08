'use client'

import type { Representative } from '@/domain/types'

interface InactiveRepresentativesPanelProps {
  emptyMessage?: string
  headerLabel?: string
  inactiveReps: Representative[]
  alwaysExpanded?: boolean
  onSelect: (rep: Representative) => void
  selectedRepId: string | null
  showInactive: boolean
  onToggle: () => void
}

export function InactiveRepresentativesPanel({
  emptyMessage = 'No hay representantes inactivos para mostrar con estos filtros.',
  headerLabel,
  inactiveReps,
  alwaysExpanded = false,
  onSelect,
  selectedRepId,
  showInactive,
  onToggle,
}: InactiveRepresentativesPanelProps) {
  if (inactiveReps.length === 0 && !alwaysExpanded) {
    return null
  }

  const isOpen = alwaysExpanded || showInactive

  return (
    <div style={{ marginTop: '24px' }}>
      {alwaysExpanded ? (
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-main)',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          {headerLabel ?? 'Representantes inactivos'}
        </div>
      ) : (
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
      )}
      {isOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {inactiveReps.length === 0 ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px dashed rgba(148, 163, 184, 0.3)',
                background: 'rgba(248, 250, 252, 0.88)',
                color: '#64748b',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              {emptyMessage}
            </div>
          ) : (
            inactiveReps.map(rep => (
              <div
                key={rep.id}
                onClick={() => onSelect(rep)}
                style={{
                  padding: '12px 16px',
                  background:
                    selectedRepId === rep.id
                      ? 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.98) 100%)'
                      : '#f8fafc',
                  border:
                    selectedRepId === rep.id
                      ? '1px solid rgba(100, 116, 139, 0.28)'
                      : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#6b7280',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{rep.name}</div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
                  Inactivo · Selecciónalo para revisar o editar su ficha.
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
