'use client'

import type { CSSProperties } from 'react'
import type { OperationalCompetitiveShiftTable } from '@/domain/reports/operationalTypes'

function formatTarget(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  })
}

function formatTargetLabel(value: number) {
  return value > 0 ? `Meta: ${formatTarget(value)}` : 'Sin meta'
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function getProgressTone(value: number) {
  if (value >= 100) return '#10b981'
  if (value >= 60) return '#f59e0b'
  return '#ef4444'
}

const SHIFT_THEME = {
  DAY: {
    accent: '#e10613',
    accentDark: '#bc0410',
    soft: 'rgba(255, 241, 242, 0.96)',
    border: 'rgba(185, 28, 28, 0.18)',
  },
  NIGHT: {
    accent: '#0f172a',
    accentDark: '#020617',
    soft: 'rgba(248, 250, 252, 0.98)',
    border: 'rgba(15, 23, 42, 0.14)',
  },
} as const

const SEGMENT_THEME = {
  PART_TIME: {
    chip: 'rgba(239, 246, 255, 0.96)',
    chipBorder: 'rgba(59, 130, 246, 0.22)',
    chipText: '#1d4ed8',
  },
  FULL_TIME: {
    chip: 'rgba(240, 253, 244, 0.96)',
    chipBorder: 'rgba(34, 197, 94, 0.22)',
    chipText: '#15803d',
  },
  MIXTO: {
    chip: 'rgba(255, 247, 237, 0.96)',
    chipBorder: 'rgba(249, 115, 22, 0.24)',
    chipText: '#c2410c',
  },
} as const

function getProgressCellStyle(value: number): CSSProperties {
  if (value >= 100) {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (value >= 85) {
    return {
      background: '#fef3c7',
      color: '#92400e',
    }
  }

  return {
    background: '#fee2e2',
    color: '#b91c1c',
  }
}

function getPenaltyCellStyle(value: number): CSSProperties {
  if (value <= 0) {
    return {
      color: '#111827',
    }
  }

  if (value <= 2) {
    return {
      background: '#fef3c7',
      color: '#92400e',
    }
  }

  return {
    background: '#fee2e2',
    color: '#b91c1c',
  }
}

function getChangeCellStyle(value: number | null): CSSProperties {
  if (value === null) {
    return {
      color: '#6b7280',
    }
  }

  if (value > 0) {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (value < 0) {
    return {
      background: '#fee2e2',
      color: '#b91c1c',
    }
  }

  return {
    background: '#f3f4f6',
    color: '#374151',
  }
}

function getRankBadgeStyle(index: number): CSSProperties {
  if (index === 0) {
    return {
      background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
      color: '#fff7ed',
      border: '1px solid rgba(217, 119, 6, 0.28)',
    }
  }

  return {
    background: 'rgba(239,68,68,0.08)',
    color: '#b91c1c',
    border: '1px solid rgba(239,68,68,0.12)',
  }
}

type OperationalCompetitiveShiftLeaderboardProps = {
  comparisonEnabled: boolean
  comparisonLabel: string
  table: OperationalCompetitiveShiftTable
}

export function OperationalCompetitiveShiftLeaderboard({
  comparisonEnabled,
  comparisonLabel,
  table,
}: OperationalCompetitiveShiftLeaderboardProps) {
  const printHiddenColumns = new Set([
    'Meta',
    'Últ. día',
    'Sem.',
    'Mes',
    'Anul.',
    'Err.',
    'Aus.',
    'Tard.',
  ])
  const shiftTheme = SHIFT_THEME[table.shift]
  const totalRepresentatives = table.segments.reduce(
    (total, segment) => total + segment.summary.representatives,
    0
  )
  const totalTransactions = table.segments.reduce(
    (total, segment) => total + segment.summary.validTransactions,
    0
  )
  const totalIncidents = table.segments.reduce(
    (total, segment) => total + segment.summary.incidents,
    0
  )
  const hasPartialData =
    table.pendingAgentNames.length > 0 || table.missingAgentRegistrations > 0

  return (
    <section
      className="report-shift-section"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        border: `1px solid ${shiftTheme.border}`,
        background: '#ffffff',
        boxShadow: '0 24px 44px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="report-print-only report-print-summary-strip"
      >
        <span>Ranking operativo por turno · {table.label}</span>
        <span>{comparisonEnabled ? `Comparado con ${comparisonLabel}` : 'Sin comparativa'}</span>
      </div>

      <div
        className="report-screen-only"
        style={{
          padding: '18px 18px 16px',
          background: `linear-gradient(180deg, ${shiftTheme.accent} 0%, ${shiftTheme.accentDark} 100%)`,
          color: 'white',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.88,
              marginBottom: '8px',
            }}
          >
            Reporte operativo
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.18rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {table.label}
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '54ch',
            }}
          >
            La tabla prioriza transacciones y cumplimiento de meta. Errores,
            ausencias y tardanzas quedan como seguimiento interno.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {[ 
            `${totalRepresentatives} representantes`,
            `${totalTransactions.toLocaleString('en-US')} transacciones`,
            `${totalIncidents.toLocaleString('en-US')} incidencias`,
            hasPartialData ? 'Datos incompletos' : 'Datos listos',
          ].map(value => (
            <span
              key={value}
              style={{
                padding: '7px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.14)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {value}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: `linear-gradient(180deg, ${shiftTheme.soft} 0%, rgba(255,255,255,1) 28%)`,
        }}
      >
        {table.segments.map(segment => {
          const segmentTheme = SEGMENT_THEME[segment.segment]

          return (
            <div
              key={segment.segment}
              style={{
                borderRadius: '20px',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.92)',
                  background:
                    'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(241,245,249,0.88) 100%)',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: 'fit-content',
                    padding: '6px 10px',
                    borderRadius: '999px',
                    background: segmentTheme.chip,
                    border: `1px solid ${segmentTheme.chipBorder}`,
                    color: segmentTheme.chipText,
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {segment.label}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#334155',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  Meta del bloque: {formatTarget(segment.summary.target)} | Transacciones:{' '}
                  {segment.summary.validTransactions.toLocaleString('en-US')} | Cumplido:{' '}
                  {formatPercent(segment.summary.progressPct)}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}
                >
                  Anuladas: {segment.summary.cancelledTransactions} | Errores:{' '}
                  {segment.summary.errors} | Ausencias: {segment.summary.absences} |
                  Tardanzas: {segment.summary.tardiness} | Personas:{' '}
                  {segment.summary.representatives}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    minWidth: comparisonEnabled ? '1460px' : '1320px',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: 'rgba(241, 245, 249, 0.96)',
                        borderBottom: '1px solid rgba(203, 213, 225, 0.92)',
                      }}
                    >
                      {[
                        'Pos.',
                        'Representante',
                        'Meta',
                        'Transacciones',
                        'Últ. día',
                        'Sem.',
                        'Mes',
                        '% cumplido',
                        'Anul.',
                        'Err.',
                        'Aus.',
                        'Tard.',
                        ...(comparisonEnabled ? [`Cambio vs ${comparisonLabel}`] : []),
                      ].map(column => (
                        <th
                          key={column}
                          className={printHiddenColumns.has(column) ? 'report-print-hide' : undefined}
                          style={{
                            padding: '12px 14px',
                            textAlign:
                              column === 'Representante' ? 'left' : 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {segment.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={comparisonEnabled ? 13 : 12}
                          style={{
                            padding: '20px 14px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#64748b',
                            background: 'rgba(248,250,252,0.8)',
                          }}
                        >
                          No hay representantes visibles en este bloque para el
                          período seleccionado.
                        </td>
                      </tr>
                    ) : (
                      segment.rows.map((row, index) => (
                        <tr
                          key={`${row.representativeId}:${row.shift}`}
                          style={{
                            borderBottom: '1px solid rgba(226, 232, 240, 0.86)',
                            background:
                              index === 0
                                ? 'rgba(255, 247, 237, 0.95)'
                                : index % 2 === 0
                                  ? 'rgba(255,255,255,0.98)'
                                  : 'rgba(248,250,252,0.88)',
                          }}
                        >
                          <td
                            style={{
                              padding: '13px 10px',
                              textAlign: 'center',
                            }}
                          >
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '999px',
                                display: 'inline-grid',
                                placeItems: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                                ...getRankBadgeStyle(index),
                              }}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '13px 14px',
                              background: row.hasUnlinkedDataWarning
                                ? 'rgba(255, 247, 237, 0.92)'
                                : undefined,
                            }}
                          >
                            <div style={{ display: 'grid', gap: '5px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#111827',
                                    fontWeight: 800,
                                  }}
                                >
                                  {row.name}
                                </span>
                                {index === 0 ? (
                                  <span
                                    style={{
                                      width: 'fit-content',
                                      padding: '4px 7px',
                                      borderRadius: '999px',
                                      background: 'rgba(254,243,199,0.96)',
                                      color: '#92400e',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    Lider
                                  </span>
                                ) : null}
                                {row.hasUnlinkedDataWarning ? (
                                  <span
                                    style={{
                                      width: 'fit-content',
                                      padding: '4px 7px',
                                      borderRadius: '999px',
                                      background: 'rgba(254,243,199,0.96)',
                                      color: '#92400e',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    Enlaces pendientes
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td
                            className="report-print-hide"
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 700,
                              color: '#334155',
                            }}
                          >
                            {formatTargetLabel(row.target)}
                          </td>
                          <td
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 800,
                              color: '#111827',
                            }}
                          >
                            {row.validTransactions.toLocaleString('en-US')}
                          </td>
                          <td style={{ padding: '13px 14px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                            {row.lastLoadedDayTransactions.toLocaleString('en-US')}
                          </td>
                          <td style={{ padding: '13px 14px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                            {row.weeklyTransactions.toLocaleString('en-US')}
                          </td>
                          <td style={{ padding: '13px 14px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                            {row.monthlyTransactions.toLocaleString('en-US')}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'center',
                              fontWeight: 800,
                              ...getProgressCellStyle(row.progressPct),
                            }}
                          >
                            <div style={{ display: 'grid', gap: '6px' }}>
                              <div
                                className="report-progress-track"
                                style={{
                                  height: '6px',
                                  borderRadius: '999px',
                                  background: '#0f172a',
                                  opacity: 0.28,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  className="report-progress-fill"
                                  style={{
                                    height: '100%',
                                    borderRadius: '999px',
                                    width: `${Math.max(0, Math.min(row.progressPct, 100))}%`,
                                    background: getProgressTone(row.progressPct),
                                  }}
                                />
                              </div>
                              <span>{formatPercent(row.progressPct)}</span>
                            </div>
                          </td>
                          <td
                            className="report-print-hide"
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 700,
                              ...getPenaltyCellStyle(row.cancelledTransactions),
                            }}
                          >
                            {row.cancelledTransactions > 0 ? (<span className="report-flag-badge">{row.cancelledTransactions.toLocaleString('en-US')}</span>) : '—'}
                          </td>
                          <td
                            className="report-print-hide"
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 700,
                              ...getPenaltyCellStyle(row.errors),
                            }}
                          >
                            {row.errors > 0 ? (<span className="report-flag-badge">{row.errors.toLocaleString('en-US')}</span>) : '—'}
                          </td>
                          <td
                            className="report-print-hide"
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 700,
                              ...getPenaltyCellStyle(row.absences),
                            }}
                          >
                            {row.absences > 0 ? (<span className="report-flag-badge">{row.absences.toLocaleString('en-US')}</span>) : '—'}
                          </td>
                          <td
                            className="report-print-hide"
                            style={{
                              padding: '13px 14px',
                              textAlign: 'center',
                              fontWeight: 700,
                              ...getPenaltyCellStyle(row.tardiness),
                            }}
                          >
                            {row.tardiness > 0 ? (<span className="report-flag-badge">{row.tardiness.toLocaleString('en-US')}</span>) : '—'}
                          </td>
                          {comparisonEnabled ? (
                            <td
                              style={{
                                padding: '13px 14px',
                                textAlign: 'center',
                                fontWeight: 800,
                                ...getChangeCellStyle(row.comparisonDelta),
                              }}
                            >
                              {row.comparisonDelta === null
                                ? 'Sin comparacion'
                                : row.comparisonDelta === 0
                                  ? '≈ ayer'
                                  : `${row.comparisonDelta > 0 ? '▲' : '▼'}${Math.abs(row.comparisonDelta).toLocaleString('en-US')}`}
                            </td>
                          ) : null}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
