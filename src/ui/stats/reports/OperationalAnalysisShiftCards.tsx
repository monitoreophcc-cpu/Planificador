'use client'

import { Moon, Sun } from 'lucide-react'
import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalDeltaBadge } from './OperationalDeltaBadge'

interface OperationalAnalysisShiftCardsProps {
  analysis: OperationalAnalysis
}

export function OperationalAnalysisShiftCards({
  analysis,
}: OperationalAnalysisShiftCardsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          Comparación por turnos
        </div>
        <h4
          style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Cómo se reparte la presión por turno
        </h4>
      </div>
      <div
        className="operational-analysis-shift-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
      >
        {analysis.shifts.map(shift => (
          <div
            key={shift.shift}
            style={{
              border: '1px solid var(--shell-border)',
              borderRadius: '20px',
              padding: '18px',
              background:
                'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '14px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  background:
                    shift.shift === 'DAY'
                      ? 'var(--bg-warning)'
                      : 'rgba(var(--accent-rgb), 0.1)',
                  border:
                    shift.shift === 'DAY'
                      ? '1px solid var(--border-warning)'
                      : '1px solid rgba(var(--accent-rgb), 0.16)',
                  color:
                    shift.shift === 'DAY'
                      ? 'var(--text-warning)'
                      : 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {shift.shift === 'DAY' ? <Sun size={14} /> : <Moon size={14} />}
                Turno {shift.shift === 'DAY' ? 'Día' : 'Noche'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: '12px',
                  fontSize: '13px',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '1px solid rgba(202, 189, 168, 0.38)',
                  background: 'rgba(255,255,255,0.56)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Incidencias
                  </div>
                  <div style={{ marginTop: '4px', color: 'var(--text-main)' }}>
                    <strong>{shift.base.incidents}</strong> vs {shift.compared.incidents}
                  </div>
                </div>
                <OperationalDeltaBadge value={shift.delta.incidents} inverse />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: '12px',
                  fontSize: '13px',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '1px solid rgba(202, 189, 168, 0.38)',
                  background: 'rgba(255,255,255,0.56)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Puntos
                  </div>
                  <div style={{ marginTop: '4px', color: 'var(--text-main)' }}>
                    <strong>{shift.base.points}</strong> vs {shift.compared.points}
                  </div>
                </div>
                <OperationalDeltaBadge value={shift.delta.points} inverse />
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 860px) {
          .operational-analysis-shift-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
