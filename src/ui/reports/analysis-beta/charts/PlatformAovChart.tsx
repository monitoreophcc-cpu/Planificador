'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import { getAggregatedAov, getAovByPlatform } from '@/ui/reports/analysis-beta/services/chart.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';

if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
}

export default function PlatformAovChart() {
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const selectedMonthKey = useDashboardStore((state) => state.selectedMonthKey);
  const monthlySnapshots = useDashboardStore((state) => state.monthlySnapshots);
  const aovChartMode = useDashboardStore((state) => state.aovChartMode);
  const setAovChartMode = useDashboardStore((state) => state.setAovChartMode);
  const filteredTransactions = dataDate
    ? transactions.filter((record) => record.fecha === dataDate)
    : [];
  const monthSnapshot = selectedMonthKey ? monthlySnapshots[selectedMonthKey] : null;
  const snapshotPlatforms = monthSnapshot?.platforms ?? [];
  const callCenterTransactions = snapshotPlatforms
    .filter((row) => row.plataforma === 'Call center')
    .reduce((total, row) => total + row.transacciones, 0);
  const callCenterSales = snapshotPlatforms
    .filter((row) => row.plataforma === 'Call center')
    .reduce((total, row) => total + row.ventas, 0);
  const restTransactions = snapshotPlatforms
    .filter((row) => row.plataforma !== 'Call center')
    .reduce((total, row) => total + row.transacciones, 0);
  const restSales = snapshotPlatforms
    .filter((row) => row.plataforma !== 'Call center')
    .reduce((total, row) => total + row.ventas, 0);

  const chartData =
    filteredTransactions.length > 0
      ? aovChartMode === 'agg'
        ? getAggregatedAov(filteredTransactions)
        : getAovByPlatform(filteredTransactions)
      : aovChartMode === 'agg'
        ? {
            labels: ['Call center', 'Resto de plataformas'],
            values: [
              callCenterTransactions > 0
                ? callCenterSales / callCenterTransactions
                : 0,
              restTransactions > 0 ? restSales / restTransactions : 0,
            ],
          }
        : {
            labels: snapshotPlatforms.map((row) => row.plataforma),
            values: snapshotPlatforms.map((row) => row.ticketPromedio),
          };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Ticket Promedio',
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
          <CardTitle>Ticket promedio</CardTitle>
          <PillToggleContainer>
            <PillButton
              onClick={() => setAovChartMode('agg')}
              isActive={aovChartMode === 'agg'}
            >
              CC vs Resto
            </PillButton>
            <PillButton
              onClick={() => setAovChartMode('plat')}
              isActive={aovChartMode === 'plat'}
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

