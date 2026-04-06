'use client'

interface ManagerScheduleHeaderProps {
  embedded?: boolean
  isCurrentWeek: boolean
  weekLabel: string
  onCopyWeek: () => void
  onGoToday: () => void
  onNextWeek: () => void
  onPrevWeek: () => void
}

export function ManagerScheduleHeader({
  embedded = false,
  isCurrentWeek,
  weekLabel,
  onCopyWeek,
  onGoToday,
  onNextWeek,
  onPrevWeek,
}: ManagerScheduleHeaderProps) {
  return (
    <div
      style={{
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {!embedded ? (
        <>
          <div>
            <h3
              style={{
                margin: '0 0 var(--space-xs) 0',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-main)',
              }}
            >
              Horarios de Gerencia
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-muted)',
              }}
            >
              Planificacion semanal con soporte para incidencias.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
            }}
          >
            {!isCurrentWeek && (
              <button
                onClick={onGoToday}
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Hoy
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                background: 'var(--bg-surface)',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <button
                onClick={onPrevWeek}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                }}
              >
                &lt;
              </button>
              <span
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  width: '220px',
                  textAlign: 'center',
                  color: 'var(--text-main)',
                }}
              >
                {weekLabel}
              </span>
              <button
                onClick={onNextWeek}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      ) : (
        <div />
      )}

      <div style={{ marginLeft: '12px' }}>
        <button
          onClick={onCopyWeek}
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 12px',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            color: 'var(--text-main)',
          }}
          title="Copiar planificación a la próxima semana"
        >
          Copiar ➝
        </button>
      </div>
    </div>
  )
}
