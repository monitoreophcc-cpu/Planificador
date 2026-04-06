'use client'

import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalDeltaBadge } from './OperationalDeltaBadge'

interface OperationalAnalysisShiftCardsProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisShiftCards({
  analysis,
}: OperationalAnalysisShiftCardsProps) {
  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>
        Comparación por Turnos
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {analysis.shifts.map(shift => (
          <div
            key={shift.shift}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <h5 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
              Turno {shift.shift === 'DAY' ? 'Día' : 'Noche'}
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}
              >
                <span>Incidencias:</span>
                <span>
                  <strong>{shift.base.incidents}</strong> vs {shift.compared.incidents}
                  <span style={{ marginLeft: '8px' }}>
                    <OperationalDeltaBadge value={shift.delta.incidents} inverse />
                  </span>
                </span>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}
              >
                <span>Puntos:</span>
                <span>
                  <strong>{shift.base.points}</strong> vs {shift.compared.points}
                  <span style={{ marginLeft: '8px' }}>
                    <OperationalDeltaBadge value={shift.delta.points} inverse />
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
