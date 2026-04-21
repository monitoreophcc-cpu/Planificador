'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { GitCompareArrows } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/reports/analysis-beta/ui/card';
import type { MonthlyOperationalSnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

type QuarterlySnapshot = {
  quarterKey: string;
  label: string;
  contestadas: number;
  transaccionesCC: number;
  conversion: number;
  loadedDays: number;
  expectedDays: number;
};

function buildQuarterKey(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const quarter = Math.floor(((month ?? 1) - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

function buildQuarterLabel(quarterKey: string) {
  const [year, rawQuarter] = quarterKey.split('-Q');
  return `T${rawQuarter} ${year}`;
}

function aggregateQuarterlyHistory(
  monthlyHistory: Record<string, MonthlyOperationalSnapshot>
): QuarterlySnapshot[] {
  const quarterMap = new Map<string, QuarterlySnapshot>();

  Object.values(monthlyHistory)
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .forEach((snapshot) => {
      const quarterKey = buildQuarterKey(snapshot.monthKey);
      const current = quarterMap.get(quarterKey) ?? {
        quarterKey,
        label: buildQuarterLabel(quarterKey),
        contestadas: 0,
        transaccionesCC: 0,
        conversion: 0,
        loadedDays: 0,
        expectedDays: 0,
      };

      current.contestadas += snapshot.kpis.contestadas;
      current.transaccionesCC += snapshot.kpis.transaccionesCC;
      current.loadedDays += snapshot.loadedDays;
      current.expectedDays += snapshot.expectedDays;
      current.conversion =
        current.contestadas > 0
          ? (current.transaccionesCC / current.contestadas) * 100
          : 0;

      quarterMap.set(quarterKey, current);
    });

  return [...quarterMap.values()].sort((left, right) =>
    left.quarterKey.localeCompare(right.quarterKey)
  );
}

export default function QuarterlyComparisonChart() {
  const monthlyHistory = useDashboardStore((state) => state.monthlyHistory);
  const selectedMonthKey = useDashboardStore((state) => state.selectedMonthKey);
  const activeQuarterKey = selectedMonthKey ? buildQuarterKey(selectedMonthKey) : null;
  const quarterRows = useMemo(
    () => aggregateQuarterlyHistory(monthlyHistory).slice(-6),
    [monthlyHistory]
  );

  if (quarterRows.length === 0) {
    return null;
  }

  const data = {
    labels: quarterRows.map((row) => row.label),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Contestadas',
        data: quarterRows.map((row) => row.contestadas),
        backgroundColor: quarterRows.map((row) =>
          row.quarterKey === activeQuarterKey ? '#0f172a' : '#cbd5e1'
        ),
        borderRadius: 10,
      },
      {
        type: 'bar' as const,
        label: 'Transacciones CC',
        data: quarterRows.map((row) => row.transaccionesCC),
        backgroundColor: quarterRows.map((row) =>
          row.quarterKey === activeQuarterKey ? '#dc2626' : '#fecaca'
        ),
        borderRadius: 10,
      },
      {
        type: 'line' as const,
        label: '% Conversión',
        data: quarterRows.map((row) => row.conversion),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.14)',
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
          afterBody: (items: Array<{ dataIndex: number }>) => {
            const quarter = quarterRows[items[0]?.dataIndex ?? 0];
            return `Cobertura: ${quarter.loadedDays}/${quarter.expectedDays} dias`;
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
          color: '#475569',
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
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
            <GitCompareArrows className="h-4 w-4 text-red-600" />
            Comparativa trimestral
          </CardTitle>
          <p className="text-sm text-slate-500">
            Volumen y conversión comparados por trimestre sobre el historial cargado.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <Bar data={data as never} options={options as never} />
        </div>
      </CardContent>
    </Card>
  );
}
