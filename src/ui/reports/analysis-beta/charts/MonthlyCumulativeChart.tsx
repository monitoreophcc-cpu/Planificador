'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/reports/analysis-beta/ui/card';
import type { DailySnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

function formatDayLabel(date: string): string {
  return date.slice(8, 10);
}

export default function MonthlyCumulativeChart() {
  const selectedMonthKey = useDashboardStore((state) => state.selectedMonthKey);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const monthlyHistory = useDashboardStore((state) => state.monthlyHistory);
  const monthlySnapshots = useDashboardStore((state) => state.monthlySnapshots);

  const monthSnapshot = selectedMonthKey ? monthlyHistory[selectedMonthKey] ?? null : null;
  const reportSnapshot = selectedMonthKey ? monthlySnapshots[selectedMonthKey] ?? null : null;
  const chartRows = useMemo(() => {
    if (reportSnapshot?.dailyCumulative.length) {
      return reportSnapshot.dailyCumulative.map((row) => ({
        label: formatDayLabel(row.date),
        contestadas: row.contestadas,
        transacciones: row.transaccionesCC,
        ventas: row.ventasValidas,
      }));
    }

    if (!monthSnapshot) {
      return [];
    }

    let accumulatedAnswered = 0;
    let accumulatedTransactions = 0;
    let accumulatedSales = 0;

    return monthSnapshot.loadedDates
      .slice()
      .sort()
      .map((date) => dailyHistory[date])
      .filter((snapshot): snapshot is DailySnapshot => Boolean(snapshot))
      .map((snapshot) => {
        accumulatedAnswered += snapshot.kpis.contestadas;
        accumulatedTransactions += snapshot.kpis.transaccionesCC;
        accumulatedSales += snapshot.kpis.ventasValidas;

        return {
          label: formatDayLabel(snapshot.date),
          contestadas: accumulatedAnswered,
          transacciones: accumulatedTransactions,
          ventas: accumulatedSales,
        };
      });
  }, [dailyHistory, monthSnapshot, reportSnapshot]);

  if (!monthSnapshot || chartRows.length === 0) {
    return null;
  }

  const data = {
    labels: chartRows.map((row) => row.label),
    datasets: [
      {
        type: 'line' as const,
        label: 'Contestadas acumuladas',
        data: chartRows.map((row) => row.contestadas),
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.12)',
        pointBackgroundColor: '#0f172a',
        pointRadius: 3,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Transacciones CC acumuladas',
        data: chartRows.map((row) => row.transacciones),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.12)',
        pointBackgroundColor: '#dc2626',
        pointRadius: 3,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Ventas acumuladas',
        data: chartRows.map((row) => row.ventas),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.12)',
        pointBackgroundColor: '#d97706',
        pointRadius: 3,
        tension: 0.35,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 18,
          font: {
            size: 11,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
            const label = context.dataset.label ?? '';
            const value =
              label === 'Ventas acumuladas'
                ? `RD$ ${context.parsed.y.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : context.parsed.y.toLocaleString('en-US');
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 10,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e2e8f0',
        },
        ticks: {
          color: '#475569',
          font: {
            size: 10,
            weight: 'bold' as const,
          },
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#b45309',
          font: {
            size: 10,
            weight: 'bold' as const,
          },
          callback: (value: string | number) => `RD$ ${Number(value).toLocaleString('en-US')}`,
        },
      },
    },
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
            <TrendingUp className="h-4 w-4 text-red-600" />
            Acumulado del mes
          </CardTitle>
          <p className="text-sm text-slate-500">
            {monthSnapshot.monthLabel} · {monthSnapshot.loadedDays}/{monthSnapshot.expectedDays} días cargados
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <Line data={data} options={options as never} />
        </div>
      </CardContent>
    </Card>
  );
}
