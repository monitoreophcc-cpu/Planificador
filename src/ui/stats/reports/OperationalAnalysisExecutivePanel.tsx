'use client'

import { AlertTriangle, Gauge, Moon, ShieldCheck, Sun, TrendingDown } from 'lucide-react'
import type { OperationalAnalysis } from '@/domain/analysis/analysisTypes'
import { OperationalDeltaBadge } from './OperationalDeltaBadge'

interface OperationalAnalysisExecutivePanelProps {
  analysis: OperationalAnalysis
}

function AnalysisMetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: number
  delta: number
  icon: typeof AlertTriangle
  tone?: 'default' | 'danger'
}) {
  return (
    <div
      style={{
        padding: '18px',
        borderRadius: '18px',
        border: '1px solid rgba(202, 189, 168, 0.4)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(248,242,233,0.36) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            background:
              tone === 'danger'
                ? 'var(--bg-danger)'
                : 'rgba(var(--accent-rgb), 0.08)',
            border:
              tone === 'danger'
                ? '1px solid var(--border-danger)'
                : '1px solid rgba(var(--accent-rgb), 0.16)',
            color: tone === 'danger' ? 'var(--text-danger)' : 'var(--accent)',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <OperationalDeltaBadge value={delta} inverse />
      </div>
      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: '6px',
            fontSize: '30px',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export function OperationalAnalysisExecutivePanel({
  analysis,
}: OperationalAnalysisExecutivePanelProps) {
  const leadingShift = [...analysis.shifts].sort((a, b) => {
    if (b.base.points !== a.base.points) {
      return b.base.points - a.base.points
    }

    return b.base.incidents - a.base.incidents
  })[0]

  const leadingShiftLabel = leadingShift?.shift === 'DAY' ? 'Día' : 'Noche'
  const LeadingShiftIcon = leadingShift?.shift === 'DAY' ? Sun : Moon

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <AnalysisMetricCard
          label="Incidencias base"
          value={analysis.base.metrics.incidents}
          delta={analysis.compared.delta.incidents}
          icon={AlertTriangle}
          tone="danger"
        />
        <AnalysisMetricCard
          label="Puntos base"
          value={analysis.base.metrics.points}
          delta={analysis.compared.delta.points}
          icon={TrendingDown}
          tone="danger"
        />
        <AnalysisMetricCard
          label="Ausencias"
          value={analysis.base.metrics.absences}
          delta={analysis.compared.delta.absences}
          icon={Gauge}
        />
        <AnalysisMetricCard
          label="Licencias"
          value={analysis.base.metrics.licenses}
          delta={analysis.compared.delta.licenses}
          icon={ShieldCheck}
        />
      </div>

      <div className="analysis-executive-grid">
        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            border: '1px solid var(--shell-border)',
            background:
              'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
            }}
          >
            Enfoque del análisis
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {analysis.base.period.label}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Referencia contrastada: <strong>{analysis.compared.period.label}</strong>
          </p>
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              gap: '10px',
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
                background: 'var(--bg-warning)',
                border: '1px solid var(--border-warning)',
                color: 'var(--text-warning)',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              <AlertTriangle size={14} />
              {analysis.risk.needsAttention.length} en atención
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'var(--bg-success)',
                border: '1px solid var(--border-success)',
                color: 'var(--text-success)',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              <ShieldCheck size={14} />
              {analysis.risk.topPerformers.length} destacados
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            border: '1px solid var(--shell-border)',
            background:
              'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '10px',
            }}
          >
            Turno dominante
          </div>
          {leadingShift ? (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  background:
                    leadingShift.shift === 'DAY'
                      ? 'var(--bg-warning)'
                      : 'rgba(var(--accent-rgb), 0.1)',
                  border:
                    leadingShift.shift === 'DAY'
                      ? '1px solid var(--border-warning)'
                      : '1px solid rgba(var(--accent-rgb), 0.16)',
                  color:
                    leadingShift.shift === 'DAY'
                      ? 'var(--text-warning)'
                      : 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <LeadingShiftIcon size={14} />
                Turno {leadingShiftLabel}
              </div>
              <div
                style={{
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Incidencias
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {leadingShift.base.incidents}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Puntos
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {leadingShift.base.points}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No hay datos por turno para este análisis.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .analysis-executive-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.95fr);
          gap: 16px;
        }

        @media (max-width: 960px) {
          .analysis-executive-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
