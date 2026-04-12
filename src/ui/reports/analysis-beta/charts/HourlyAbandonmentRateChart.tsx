'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Line } from 'react-chartjs-2';
import { aggregateByTimeSlot } from '@/ui/reports/analysis-beta/services/kpi.service';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';

// Hourly Abandonment Rate Chart Component
export default function HourlyAbandonmentRateChart() {
  const answeredCalls = useDashboardStore((state) => state.answeredCalls);
  const abandonedCalls = useDashboardStore((state) => state.abandonedCalls);
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const hourlyChartShift = useDashboardStore((state) => state.hourlyChartShift);
  const setHourlyChartShift = useDashboardStore((state) => state.setHourlyChartShift);
  const filteredAnswered = dataDate
    ? answeredCalls.filter((record) => record.fecha === dataDate)
    : [];
  const filteredAbandoned = dataDate
    ? abandonedCalls.filter((record) => record.fecha === dataDate)
    : [];
  const filteredTransactions = dataDate
    ? transactions.filter((record) => record.fecha === dataDate)
    : [];

  const timeSlotData = aggregateByTimeSlot(
    filteredAnswered,
    filteredAbandoned,
    filteredTransactions
  );
  const chartDetails =
    hourlyChartShift === 'Día' ? timeSlotData.day : timeSlotData.night;

  const data = {
    labels: chartDetails.map((s) => s.hora),
    datasets: [
      {
        label: '% Abandono',
        data: chartDetails.map((s) => s.pctAband),
        borderColor: '#b91c1c', // Rojo Corporativo
        backgroundColor: 'rgba(185, 28, 28, 0.1)', // Rojo Corporativo con opacidad
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#b91c1c',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#b91c1c',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  if (filteredAnswered.length === 0 && filteredAbandoned.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>Tasa de Abandono por Hora</CardTitle>
          <PillToggleContainer>
            <PillButton
              onClick={() => setHourlyChartShift('Día')}
              isActive={hourlyChartShift === 'Día'}
            >
              Día
            </PillButton>
            <PillButton
              onClick={() => setHourlyChartShift('Noche')}
              isActive={hourlyChartShift === 'Noche'}
            >
              Noche
            </PillButton>
          </PillToggleContainer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Line options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}

