'use client'

import type { LucideIcon } from 'lucide-react'
import type { RepresentativeRisk } from '@/domain/reports/operationalTypes'

interface OperationalReportPersonListProps {
  title: string
  data: RepresentativeRisk[]
  icon: LucideIcon
  variant: 'success' | 'danger'
}

export function OperationalReportPersonList({
  title,
  data,
  icon: Icon,
  variant,
}: OperationalReportPersonListProps) {
  const tone =
    variant === 'success'
      ? {
          color: 'var(--text-success)',
          background: 'var(--bg-success)',
          border: 'var(--border-success)',
        }
      : {
          color: 'var(--text-danger)',
          background: 'var(--bg-danger)',
          border: 'var(--border-danger)',
        }

  return (
    <div
      style={{
        border: '1px solid var(--shell-border)',
        borderRadius: '22px',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        height: '100%',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '18px 20px',
          borderBottom: '1px solid var(--shell-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(248,242,233,0.72) 100%)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            background: tone.background,
            border: `1px solid ${tone.border}`,
            color: tone.color,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h3>
          <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {data.length} representantes
          </div>
        </div>
      </header>
      <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '10px' }}>
        {data.length === 0 ? (
          <div
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            No hay representantes en esta categoría.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((representative, index) => (
              <div
                key={representative.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '1px solid rgba(202, 189, 168, 0.38)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(248,242,233,0.34) 100%)',
                }}
              >
                <div
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: tone.background,
                    border: `1px solid ${tone.border}`,
                    color: tone.color,
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  #{index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {representative.name}
                  </div>
                  <div style={{ marginTop: '2px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Seguimiento del período
                  </div>
                </div>
                <div
                  style={{
                    justifySelf: 'end',
                    padding: '7px 10px',
                    borderRadius: '999px',
                    background:
                      variant === 'danger' && representative.points > 0
                        ? 'var(--bg-danger)'
                        : 'rgba(255,255,255,0.62)',
                    border: `1px solid ${
                      variant === 'danger' && representative.points > 0
                        ? 'var(--border-danger)'
                        : 'var(--shell-border)'
                    }`,
                    color:
                      variant === 'danger' && representative.points > 0
                        ? 'var(--text-danger)'
                        : 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {representative.points > 0 ? `${representative.points} pts` : 'Sin puntos'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
