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
  const aovChartMode = useDashboardStore((state) => state.aovChartMode);
  const setAovChartMode = useDashboardStore((state) => state.setAovChartMode);

  const chartData =
    aovChartMode === 'agg'
      ? getAggregatedAov(transactions)
      : getAovByPlatform(transactions);

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

  if (transactions.length === 0) {
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

