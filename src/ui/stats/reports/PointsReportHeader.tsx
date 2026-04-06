interface PointsReportHeaderProps {
  monthLabel: string
  onNext: () => void
  onPrev: () => void
}

export function PointsReportHeader({
  monthLabel,
  onNext,
  onPrev,
}: PointsReportHeaderProps) {
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
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            margin: 0,
          }}
        >
          Reporte de Puntos por Incidencia
        </h2>
        <p
          style={{
            margin: '4px 0 0',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}
        >
          Resumen mensual de incidencias punitivas y puntos, segmentado por rol
          y turno.
        </p>
      </div>
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
