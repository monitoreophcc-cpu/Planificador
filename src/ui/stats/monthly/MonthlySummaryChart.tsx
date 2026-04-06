'use client'

import { useMemo } from 'react'
import { parseISO } from 'date-fns'
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
import type { MonthlySummary } from '@/domain/analytics/types'

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

export function MonthlySummaryChart({
  summary,
}: MonthlySummaryChartProps) {
  const chartData = useMemo(() => {
    const allIncidents = summary.byPerson.flatMap(person => person.incidents)
    const [year, month] = summary.month.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const labels = Array.from({ length: daysInMonth }, (_, index) =>
      String(index + 1)
    )
    const data = new Array(daysInMonth).fill(0)

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
    }

    return {
      labels,
      datasets: [
        {
          label: 'Incidencias por Día',
          data,
          backgroundColor: data.map(value =>
            value >= 3
              ? 'hsl(0, 70%, 60%)'
              : value > 0
                ? 'hsl(40, 80%, 60%)'
                : 'hsl(210, 30%, 85%)'
          ),
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  }, [summary])

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        height: '100%',
      }}
    >
      <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Incidencias por Día</h3>
      <div style={{ height: '220px' }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: false },
              tooltip: {
                callbacks: {
                  label(context) {
                    return `Incidencias: ${context.parsed.y}`
                  },
                },
              },
            },
            scales: {
              x: { grid: { display: false } },
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: { stepSize: 1 },
              },
            },
          }}
        />
      </div>
    </div>
  )
}
