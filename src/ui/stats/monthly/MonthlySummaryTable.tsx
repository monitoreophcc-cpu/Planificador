'use client'

import type { CSSProperties } from 'react'
import type {
  PersonMonthlySummary,
  RiskLevel,
} from '@/domain/analytics/types'
import { UI_GLOSSARY } from '@/ui/copy/glossary'

interface MonthlySummaryTableProps {
  data: PersonMonthlySummary[]
  onSelectRow: (person: PersonMonthlySummary) => void
}

const headerStyle: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '1px solid rgba(202, 189, 168, 0.36)',
  background: 'rgba(244, 238, 228, 0.56)',
}

const cellStyle: CSSProperties = {
  padding: '12px 14px',
  borderTop: '1px solid rgba(202, 189, 168, 0.38)',
  fontSize: '14px',
  color: 'var(--text-main)',
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<
    RiskLevel,
    {
      label: string
      color: string
      background: string
      border: string
    }
  > = {
    danger: {
      label: 'Revisar',
      color: 'var(--text-danger)',
      background: 'var(--bg-danger)',
      border: 'var(--border-danger)',
    },
    warning: {
      label: 'Atención',
      color: 'var(--text-warning)',
      background: 'var(--bg-warning)',
      border: 'var(--border-warning)',
    },
    ok: {
      label: 'Estable',
      color: 'var(--text-success)',
      background: 'var(--bg-success)',
      border: 'var(--border-success)',
    },
  }

  const { label, color, background, border } = config[level]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        borderRadius: '999px',
        background,
        border: `1px solid ${border}`,
      }}
      title={label}
      aria-label={label}
    >
      <span
        aria-hidden="true"
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '999px',
          background: color,
          boxShadow: `0 0 0 4px ${background}`,
        }}
      />
    </div>
  )
}

function TableMetaChip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'warning'
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '999px',
        border:
          tone === 'warning'
            ? '1px solid var(--border-warning)'
            : '1px solid var(--shell-border)',
        background:
          tone === 'warning'
            ? 'var(--bg-warning)'
            : 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
        color: tone === 'warning' ? 'var(--text-warning)' : 'var(--text-main)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

export function MonthlySummaryTable({
  data,
  onSelectRow,
}: MonthlySummaryTableProps) {
  const sortedData = [...data].sort((a, b) => b.totals.puntos - a.totals.puntos)
  const attentionCount = sortedData.filter(
    person => person.riskLevel === 'danger' || person.riskLevel === 'warning'
  ).length

  return (
    <div
      style={{
        borderRadius: '20px',
        border: '1px solid rgba(202, 189, 168, 0.42)',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,242,233,0.34) 100%)',
      }}
    >
      <style jsx global>{`
        .monthly-summary-row:hover {
          background-color: rgba(244, 238, 228, 0.72) !important;
        }
      `}</style>
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(202, 189, 168, 0.36)',
        }}
      >
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
            Tabla operativa
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Ranking por incidencias del mes
          </h3>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Prioriza rápido quién necesita revisión y abre el detalle desde aquí.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <TableMetaChip
            label={UI_GLOSSARY.representative.plural}
            value={String(sortedData.length)}
          />
          <TableMetaChip
            label="Para revisar"
            value={String(attentionCount)}
            tone={attentionCount > 0 ? 'warning' : 'default'}
          />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, width: '72px', textAlign: 'center' }}>Pos.</th>
              <th style={headerStyle}>Representante</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Puntos</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Ausencias</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Tardanzas</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Errores</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Estado</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((person, index) => (
              <tr
                key={person.representativeId}
                className="monthly-summary-row"
                style={{
                  background:
                    person.riskLevel === 'danger'
                      ? 'rgba(255, 241, 237, 0.88)'
                      : person.riskLevel === 'warning'
                        ? 'rgba(255, 246, 231, 0.8)'
                        : 'transparent',
                  transition: 'background 160ms ease',
                }}
              >
                <td
                  style={{
                    ...cellStyle,
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  #{index + 1}
                </td>
                <td
                  style={{ ...cellStyle, fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {person.name}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    fontWeight: 700,
                    color:
                      person.totals.puntos > 0
                        ? 'var(--text-danger)'
                        : 'var(--text-main)',
                    textAlign: 'center',
                    fontSize: '16px',
                  }}
                >
                  {person.totals.puntos}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {person.totals.ausencias}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {person.totals.tardanzas}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {person.totals.errores}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <RiskBadge level={person.riskLevel} />
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => onSelectRow(person)}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      background: 'rgba(var(--accent-rgb), 0.08)',
                      border: '1px solid rgba(var(--accent-rgb), 0.16)',
                      padding: '8px 12px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
