'use client'

import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import { AlertTriangle, BarChart3, CalendarRange, ShieldCheck } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js'
import type { MonthlySummary, RiskLevel } from '@/domain/analytics/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
)

interface MonthlySummaryChartProps {
  summary: MonthlySummary
}

function getRiskTone(level: RiskLevel) {
  if (level === 'danger') {
    return {
      background: 'var(--bg-danger)',
      border: 'var(--border-danger)',
      text: 'var(--text-danger)',
    }
  }

  if (level === 'warning') {
    return {
      background: 'var(--bg-warning)',
      border: 'var(--border-warning)',
      text: 'var(--text-warning)',
    }
  }

  return {
    background: 'var(--bg-success)',
    border: 'var(--border-success)',
    text: 'var(--text-success)',
  }
}

export function MonthlySummaryChart({
  summary,
}: MonthlySummaryChartProps) {
  const analysis = useMemo(() => {
    const allIncidents = summary.byPerson.flatMap(person => person.incidents)
    const [year, month] = summary.month.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const labels = Array.from({ length: daysInMonth }, (_, index) =>
      String(index + 1)
    )
    const data = new Array(daysInMonth).fill(0)
    const incidentTypeCounts = new Map<string, number>()

    for (const incident of allIncidents) {
      if (!incident.startDate) {
        continue
      }

      const parsedDate = parseISO(incident.startDate)
      if (Number.isNaN(parsedDate.getTime())) {
        continue
      }

      const dayOfMonth = parsedDate.getDate()
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        data[dayOfMonth - 1] += 1
      }

      incidentTypeCounts.set(
        incident.type,
        (incidentTypeCounts.get(incident.type) ?? 0) + 1
      )
    }

    const maxIncidents = Math.max(...data, 0)
    const peakDays = data
      .map((value, index) => ({ value, day: index + 1 }))
      .filter(item => item.value === maxIncidents && item.value > 0)

    const topPeople = [...summary.byPerson]
      .sort((a, b) => b.totals.puntos - a.totals.puntos)
      .slice(0, 3)

    const topIncidentTypes = [...incidentTypeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    const daysWithIncidents = data.filter(value => value > 0).length
    const calmDays = daysInMonth - daysWithIncidents

    return {
      labels,
      data,
      maxIncidents,
      peakDays,
      topPeople,
      topIncidentTypes,
      maxTypeCount: topIncidentTypes[0]?.[1] ?? 1,
      daysWithIncidents,
      calmDays,
      atRiskCount: summary.byPerson.filter(person => person.riskLevel !== 'ok').length,
      stableCount: summary.byPerson.filter(person => person.riskLevel === 'ok').length,
    }
  }, [summary])

  const chartData = useMemo(
    () => ({
      labels: analysis.labels,
      datasets: [
        {
          label: 'Incidencias por día',
          data: analysis.data,
          backgroundColor: analysis.data.map(value =>
            value >= 3
              ? 'rgba(192, 85, 61, 0.9)'
              : value > 0
                ? 'rgba(197, 141, 69, 0.88)'
                : 'rgba(159, 183, 198, 0.42)'
          ),
          borderColor: analysis.data.map(value =>
            value >= 3
              ? 'rgba(159, 53, 40, 1)'
              : value > 0
                ? 'rgba(154, 97, 16, 1)'
                : 'rgba(159, 183, 198, 0.7)'
          ),
          borderWidth: 1,
          borderRadius: 999,
          borderSkipped: false,
          maxBarThickness: 22,
        },
      ],
    }),
    [analysis]
  )

  const peakLabel =
    analysis.peakDays.length > 0
      ? analysis.peakDays.map(item => item.day).join(', ')
      : 'Sin pico'

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.45) 100%)',
        borderRadius: '22px',
        border: '1px solid var(--shell-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--shell-border)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(248,242,233,0.72) 100%)',
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
            Lectura ejecutiva
          </div>
          <h3
            style={{
              margin: 0,
              color: 'var(--text-main)',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Ritmo de incidencias del mes
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Ubica los días más cargados y quiénes concentran la mayor presión operativa.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid var(--shell-border)',
              background:
                'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <CalendarRange size={14} color="var(--accent)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              {analysis.daysWithIncidents} día(s) con actividad
            </span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border-warning)',
              background: 'var(--bg-warning)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AlertTriangle size={14} color="var(--text-warning)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-warning)' }}>
              Pico: día {peakLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="monthly-summary-chart-grid">
        <div
          className="monthly-summary-chart-grid__chart"
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
              marginBottom: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                Incidencias por día
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {summary.totals.totalIncidents} incidencia(s) registradas en el mes
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(var(--accent-rgb), 0.08)',
                border: '1px solid rgba(var(--accent-rgb), 0.16)',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <BarChart3 size={14} />
              Máximo diario: {analysis.maxIncidents}
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(24, 34, 48, 0.92)',
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                      label(context) {
                        return `Incidencias: ${context.parsed.y}`
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: 'rgba(95, 109, 125, 0.9)',
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 12,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(202, 189, 168, 0.36)' },
                    ticks: { stepSize: 1, color: 'rgba(95, 109, 125, 0.9)' },
                  },
                },
              }}
            />
          </div>
        </div>

        <aside
          className="monthly-summary-chart-grid__side"
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '18px',
              border: '1px solid rgba(202, 189, 168, 0.4)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(248,242,233,0.36) 100%)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '10px',
              }}
            >
              Estado del equipo
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '16px',
                  background: 'var(--bg-warning)',
                  border: '1px solid var(--border-warning)',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-warning)', fontWeight: 700 }}>
                  En atención
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--text-warning)',
                  }}
                >
                  {analysis.atRiskCount}
                </div>
              </div>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '16px',
                  background: 'var(--bg-success)',
                  border: '1px solid var(--border-success)',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-success)', fontWeight: 700 }}>
                  Estables
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--text-success)',
                  }}
                >
                  {analysis.stableCount}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                fontSize: '12px',
              }}
            >
              <ShieldCheck size={14} />
              {analysis.calmDays} día(s) sin incidencias registradas
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '18px',
              border: '1px solid rgba(202, 189, 168, 0.4)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(248,242,233,0.36) 100%)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '10px',
              }}
            >
              Tipos más frecuentes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.topIncidentTypes.length > 0 ? (
                analysis.topIncidentTypes.map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{type}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '999px',
                        background: 'rgba(159, 183, 198, 0.24)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(count / analysis.maxTypeCount) * 100}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background:
                            'linear-gradient(90deg, var(--accent) 0%, var(--accent-warm) 100%)',
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No hay incidencias registradas en este mes.
                </div>
              )}
            </div>
          </div>
        </aside>

        <div
          className="monthly-summary-chart-grid__people"
          style={{
            padding: '16px',
            borderRadius: '18px',
            border: '1px solid rgba(202, 189, 168, 0.4)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(248,242,233,0.36) 100%)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}
          >
            Mayor carga de puntos
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '10px',
            }}
          >
            {analysis.topPeople.map((person, index) => {
              const tone = getRiskTone(person.riskLevel)

              return (
                <div
                  key={person.representativeId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    border: '1px solid rgba(202, 189, 168, 0.38)',
                    background: 'rgba(255,255,255,0.56)',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '10px',
                      display: 'grid',
                      placeItems: 'center',
                      background: tone.background,
                      border: `1px solid ${tone.border}`,
                      color: tone.text,
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {person.name}
                    </div>
                    <div
                      style={{
                        marginTop: '2px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {person.totals.ausencias} aus. · {person.totals.tardanzas} tard. ·{' '}
                      {person.totals.errores} err.
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '999px',
                      background:
                        person.totals.puntos > 0
                          ? 'var(--bg-danger)'
                          : 'var(--bg-success)',
                      border:
                        person.totals.puntos > 0
                          ? '1px solid var(--border-danger)'
                          : '1px solid var(--border-success)',
                      color:
                        person.totals.puntos > 0
                          ? 'var(--text-danger)'
                          : 'var(--text-success)',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {person.totals.puntos} pts
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .monthly-summary-chart-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.95fr);
          grid-template-areas:
            'chart side'
            'people people';
          gap: 22px;
          padding: 22px;
          align-items: start;
        }

        .monthly-summary-chart-grid__chart {
          grid-area: chart;
        }

        .monthly-summary-chart-grid__side {
          grid-area: side;
        }

        .monthly-summary-chart-grid__people {
          grid-area: people;
        }

        @media (max-width: 980px) {
          .monthly-summary-chart-grid {
            grid-template-columns: 1fr;
            grid-template-areas:
              'chart'
              'side'
              'people';
          }
        }
      `}</style>
    </div>
  )
}
