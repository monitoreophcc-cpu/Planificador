'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import {
  getAggregatedSales,
  getSalesByPlatform,
} from '@/ui/reports/analysis-beta/services/chart.service';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import type { TooltipItem } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';

export default function PlatformSalesChart() {
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const selectedMonthKey = useDashboardStore((state) => state.selectedMonthKey);
  const monthlySnapshots = useDashboardStore((state) => state.monthlySnapshots);
  const salesChartMode = useDashboardStore((state) => state.salesChartMode);
  const setSalesChartMode = useDashboardStore((state) => state.setSalesChartMode);
  const filteredTransactions = dataDate
    ? transactions.filter((record) => record.fecha === dataDate)
    : [];
  const monthSnapshot = selectedMonthKey ? monthlySnapshots[selectedMonthKey] : null;
  const snapshotPlatformSales = monthSnapshot?.platforms ?? [];

  const chartData =
    filteredTransactions.length > 0
      ? salesChartMode === 'agg'
        ? getAggregatedSales(filteredTransactions)
        : getSalesByPlatform(filteredTransactions)
      : salesChartMode === 'agg'
        ? {
            labels: ['Call center', 'Resto de plataformas'],
            values: [
              snapshotPlatformSales
                .filter((row) => row.plataforma === 'Call center')
                .reduce((total, row) => total + row.ventas, 0),
              snapshotPlatformSales
                .filter((row) => row.plataforma !== 'Call center')
                .reduce((total, row) => total + row.ventas, 0),
            ],
          }
        : {
            labels: snapshotPlatformSales.map((row) => row.plataforma),
            values: snapshotPlatformSales.map((row) => row.ventas),
          };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Ventas Totales',
        data: chartData.values,
        backgroundColor: [
          '#b91c1c', // Rojo Corporativo
          '#0f172a', // Negro Corporativo
          '#475569', // Slate-600
          '#dc2626', // Red-600
          '#1e293b', // Slate-800
          '#94a3b8', // Slate-400
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'DOP',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (chartData.values.length === 0 || chartData.values.every((value) => value === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>Ventas totales</CardTitle>
          <PillToggleContainer>
            <PillButton
              onClick={() => setSalesChartMode('agg')}
              isActive={salesChartMode === 'agg'}
            >
              CC vs Resto
            </PillButton>
            <PillButton
              onClick={() => setSalesChartMode('plat')}
              isActive={salesChartMode === 'plat'}
            >
              Por Plataforma
            </PillButton>
          </PillToggleContainer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

