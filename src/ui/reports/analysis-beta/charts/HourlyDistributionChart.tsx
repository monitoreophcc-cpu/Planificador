'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import { aggregateByTimeSlot } from '@/ui/reports/analysis-beta/services/kpi.service';
import '@/ui/reports/analysis-beta/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';
import { Clock } from 'lucide-react';

export default function HourlyDistributionChart() {
  const answeredCalls = useDashboardStore((state) => state.answeredCalls);
  const abandonedCalls = useDashboardStore((state) => state.abandonedCalls);
  const transactions = useDashboardStore((state) => state.transactions);
  const hourlyChartShift = useDashboardStore((state) => state.hourlyChartShift);
  const setHourlyChartShift = useDashboardStore((state) => state.setHourlyChartShift);
  const selectedHour = useDashboardStore((state) => state.selectedHour);
  const setSelectedHour = useDashboardStore((state) => state.setSelectedHour);

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
        label: 'Recibidas',
        data: chartDetails.map((s) => s.recibidas),
        backgroundColor: chartDetails.map((s) => s.hora === selectedHour ? '#333333' : '#000000'),
        borderRadius: 4,
      },
      {
        label: 'Contestadas',
        data: chartDetails.map((s) => s.contestadas),
        backgroundColor: chartDetails.map((s) => s.hora === selectedHour ? '#cbd5e1' : '#94a3b8'),
        borderRadius: 4,
      },
      {
        label: 'Abandonadas',
        data: chartDetails.map((s) => s.abandonadas),
        backgroundColor: chartDetails.map((s) => s.hora === selectedHour ? '#ef4444' : '#dc2626'),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const hour = chartDetails[index].hora;
        setSelectedHour(hour === selectedHour ? null : hour);
      } else {
        setSelectedHour(null);
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 11, weight: 'bold' as any },
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' as any }, color: '#1e293b' }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10, weight: 'bold' as any }, color: '#64748b' }
      },
    },
  };

  if (answeredCalls.length === 0 && abandonedCalls.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              Distribución de llamadas por hora
            </CardTitle>
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
        <CardContent className="pt-6">
          <div className="h-80 w-full">
            <Bar options={options} data={data} />
          </div>
        </CardContent>
      </Card>
  );
}

