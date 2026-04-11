'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Line } from 'react-chartjs-2';
import { aggregateByTimeSlot } from '@/ui/reports/analysis-beta/services/kpi.service';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';

export default function HourlyConversionRateChart() {
  const answeredCalls = useDashboardStore((state) => state.answeredCalls);
  const abandonedCalls = useDashboardStore((state) => state.abandonedCalls);
  const transactions = useDashboardStore((state) => state.transactions);
  const hourlyChartShift = useDashboardStore((state) => state.hourlyChartShift);
  const setHourlyChartShift = useDashboardStore((state) => state.setHourlyChartShift);

  const timeSlotData = aggregateByTimeSlot(
    answeredCalls,
    abandonedCalls,
    transactions
  );
  const chartDetails =
    hourlyChartShift === 'Día' ? timeSlotData.day : timeSlotData.night;

  const data = {
    labels: chartDetails.map((s) => s.hora),
    datasets: [
      {
        label: '% Conversión',
        data: chartDetails.map((s) => s.conversionRate),
        borderColor: '#0f172a', // Negro Corporativo
        backgroundColor: 'rgba(15, 23, 42, 0.1)', // Negro Corporativo con opacidad
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0f172a',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0f172a',
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
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  if (answeredCalls.length === 0 && transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>Tasa de Conversión por Hora</CardTitle>
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

