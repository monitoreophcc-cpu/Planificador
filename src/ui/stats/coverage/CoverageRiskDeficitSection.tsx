'use client'

import type { DailyDeficitDetail } from '@/application/stats/getCoverageRiskSummary'
import { DeficitTable } from './DeficitTable'

type CoverageRiskDeficitSectionProps = {
  dailyDeficits: DailyDeficitDetail[]
}

export function CoverageRiskDeficitSection({
  dailyDeficits,
}: CoverageRiskDeficitSectionProps) {
  return (
    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          Lectura detallada
        </div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Desglose de déficits del mes
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Revisa qué días y turnos quedaron por debajo de la cobertura esperada.
        </p>
      </div>
      {dailyDeficits.length > 0 ? (
        <DeficitTable deficits={dailyDeficits} />
      ) : (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background:
              'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
            borderRadius: '22px',
            border: '1px solid var(--shell-border)',
            color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
            No se detectaron déficits de cobertura para el mes seleccionado.
          </p>
        </div>
      )}
    </div>
  )
}
