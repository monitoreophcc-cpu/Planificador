'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import '@/lib/chart-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ShiftPerformanceChart() {
  const kpisByShift = useDashboardStore((state) => state.kpisByShift);

  const data = {
    labels: ['Día', 'Noche'],
    datasets: [
      {
        label: '% Atención',
        data: [kpisByShift['Día'].atencion, kpisByShift['Noche'].atencion],
        backgroundColor: '#000000', // Negro
        borderRadius: 8,
        barThickness: 40,
      },
      {
        label: '% Abandono',
        data: [kpisByShift['Día'].abandonoPct, kpisByShift['Noche'].abandonoPct],
        backgroundColor: '#dc2626', // Rojo 600
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11,
            weight: 'bold' as any,
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as any },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += context.parsed.y.toFixed(2) + '%';
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { size: 10, weight: 'bold' as any },
          color: '#64748b',
          callback: (value: string | number) => `${value}%`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: 'bold' as any },
          color: '#1e293b',
        }
      },
    },
  };

  const hasData = kpisByShift['Día'].recibidas > 0 || kpisByShift['Noche'].recibidas > 0;

  if (!hasData) return null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 py-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-600" />
            Rendimiento por Turno
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80 w-full">
            <Bar options={options} data={data} />
          </div>
        </CardContent>
      </Card>
  );
}
