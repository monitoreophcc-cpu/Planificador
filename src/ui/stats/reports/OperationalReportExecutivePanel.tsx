'use client'

import {
  AlertTriangle,
  Clock3,
  FileWarning,
  Moon,
  ShieldCheck,
  Sun,
  TrendingDown,
} from 'lucide-react'
import { INCIDENT_STYLES } from '@/domain/incidents/incidentStyles'
import type { OperationalReport } from '@/domain/reports/operationalTypes'
import { OperationalDeltaBadge } from './OperationalDeltaBadge'

interface OperationalReportExecutivePanelProps {
  report: OperationalReport
}

function ExecutiveMetricCard({
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

export function OperationalReportExecutivePanel({
  report,
}: OperationalReportExecutivePanelProps) {
  const leadingShift =
    report.shifts.DAY.points > report.shifts.NIGHT.points
      ? 'DAY'
      : report.shifts.NIGHT.points > report.shifts.DAY.points
        ? 'NIGHT'
        : report.shifts.DAY.incidents >= report.shifts.NIGHT.incidents
          ? 'DAY'
          : 'NIGHT'

  const leadingShiftStats = report.shifts[leadingShift]
  const leadingIncident = report.topIncidents[0] ?? null
  const leadingIncidentLabel = leadingIncident
    ? (INCIDENT_STYLES[leadingIncident.type as keyof typeof INCIDENT_STYLES]?.label ??
        leadingIncident.type)
    : 'Sin incidencias'
  const leadingShiftLabel = leadingShift === 'DAY' ? 'Día' : 'Noche'
  const LeadingShiftIcon = leadingShift === 'DAY' ? Sun : Moon

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <ExecutiveMetricCard
          label="Incidencias del período"
          value={report.current.metrics.incidents}
          delta={report.comparison.previous.delta.incidents}
          icon={AlertTriangle}
          tone="danger"
        />
        <ExecutiveMetricCard
          label="Puntos acumulados"
          value={report.current.metrics.points}
          delta={report.comparison.previous.delta.points}
          icon={TrendingDown}
          tone="danger"
        />
        <ExecutiveMetricCard
          label="Ausencias"
          value={report.current.metrics.absences}
          delta={report.comparison.previous.delta.absences}
          icon={FileWarning}
        />
        <ExecutiveMetricCard
          label="Licencias"
          value={report.current.metrics.licenses}
          delta={report.comparison.previous.delta.licenses}
          icon={Clock3}
        />
      </div>

      <div
        className="operational-report-executive-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.95fr) minmax(280px, 1fr)',
          gap: '16px',
        }}
      >
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
            Lectura del período
          </div>
          <div
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {report.reading}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '16px',
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
              {report.risk.needsAttention.length} en atención
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
              {report.risk.topPerformers.length} destacados
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
            Turno más exigido
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '999px',
              background:
                leadingShift === 'DAY'
                  ? 'var(--bg-warning)'
                  : 'rgba(var(--accent-rgb), 0.1)',
              border:
                leadingShift === 'DAY'
                  ? '1px solid var(--border-warning)'
                  : '1px solid rgba(var(--accent-rgb), 0.16)',
              color:
                leadingShift === 'DAY' ? 'var(--text-warning)' : 'var(--accent)',
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
                {leadingShiftStats.incidents}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                Puntos
              </div>
              <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                {leadingShiftStats.points}
              </div>
            </div>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            {leadingShiftStats.points > 0 || leadingShiftStats.incidents > 0
              ? `Es el turno que concentra más presión disciplinaria en el período actual.`
              : 'No hay presión disciplinaria registrada por turno en este período.'}
          </p>
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
            Tipo dominante
          </div>
          <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {leadingIncidentLabel}
          </div>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {leadingIncident ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Eventos registrados</span>
                  <strong style={{ color: 'var(--text-main)' }}>{leadingIncident.count}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Puntos asociados</span>
                  <strong style={{ color: 'var(--text-main)' }}>{leadingIncident.points}</strong>
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    height: '8px',
                    borderRadius: '999px',
                    background: 'rgba(159, 183, 198, 0.24)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (leadingIncident.count /
                          Math.max(leadingIncident.count, report.current.metrics.incidents || 1)) *
                          100
                      )}%`,
                      height: '100%',
                      borderRadius: '999px',
                      background:
                        'linear-gradient(90deg, var(--accent) 0%, var(--accent-warm) 100%)',
                    }}
                  />
                </div>
              </>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No hay incidencias en el período actual.
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1080px) {
          .operational-report-executive-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
