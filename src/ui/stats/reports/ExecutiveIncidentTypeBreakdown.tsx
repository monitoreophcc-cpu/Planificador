import { FileText } from 'lucide-react'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import type { IncidentTypeStats } from '@/domain/executiveReport/types'

interface ExecutiveIncidentTypeBreakdownProps {
  data: IncidentTypeStats[]
}

export function ExecutiveIncidentTypeBreakdown({
  data,
}: ExecutiveIncidentTypeBreakdownProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        background: 'var(--bg-panel)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <FileText size={18} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          Desglose por Tipo de Incidencia
        </h3>
      </header>
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {data.map(item => {
          const style = INCIDENT_STYLES[item.type] || INCIDENT_STYLES.OTRO

          return (
            <div
              key={item.type}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  fontSize: '14px',
                }}
              >
                {style.label}
              </span>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <span style={{ fontSize: '14px' }}>
                  <strong>{item.count}</strong> eventos
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#b91c1c',
                  }}
                >
                  {item.points} pts
                </span>
              </div>
            </div>
          )
        })}
        {data.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              padding: '20px 0',
            }}
          >
            No hay incidencias punitivas en este período.
          </div>
        )}
      </div>
    </div>
  )
}
