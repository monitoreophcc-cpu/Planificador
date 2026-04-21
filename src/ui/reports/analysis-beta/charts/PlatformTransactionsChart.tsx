'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import { getTransactionsByPlatform } from '@/ui/reports/analysis-beta/services/chart.service';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function PlatformTransactionsChart() {
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const selectedMonthKey = useDashboardStore((state) => state.selectedMonthKey);
  const monthlySnapshots = useDashboardStore((state) => state.monthlySnapshots);
  const filteredTransactions = dataDate
    ? transactions.filter((record) => record.fecha === dataDate)
    : [];
  const monthSnapshot = selectedMonthKey ? monthlySnapshots[selectedMonthKey] : null;
  const chartData =
    filteredTransactions.length > 0
      ? getTransactionsByPlatform(filteredTransactions)
      : {
          labels: monthSnapshot?.platforms.map((row) => row.plataforma) ?? [],
          values: monthSnapshot?.platforms.map((row) => row.transacciones) ?? [],
        };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Órdenes válidas',
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (chartData.values.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones: Monitoreo CC vs Plataformas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

