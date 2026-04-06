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
    <div style={{ marginTop: '16px' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-main)',
          marginBottom: '12px',
        }}
      >
        Desglose de Déficits del Mes
      </h3>
      {dailyDeficits.length > 0 ? (
        <DeficitTable deficits={dailyDeficits} />
      ) : (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
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
