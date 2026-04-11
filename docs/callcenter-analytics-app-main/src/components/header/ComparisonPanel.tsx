'use client';

import { useMemo } from 'react';
import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ComparisonPeriodMode } from '@/types/dashboard.types';

const periodLabels: Record<ComparisonPeriodMode, string> = {
  full_day: 'Día completo',
  shift: 'Por turno',
  custom_range: 'Rango horario',
  week: 'Semana completa',
  month: 'Mes completo',
};

function formatValue(label: string, value: number): string {
  if (label === 'Nivel de servicio' || label === 'Conversión') {
    return `${value.toFixed(1)}%`;
  }
  return value.toFixed(0);
}

export default function ComparisonPanel() {
  const availableDates = useDashboardStore((s) => s.availableDates);
  const comparisonConfig = useDashboardStore((s) => s.comparisonConfig);
  const comparisonResult = useDashboardStore((s) => s.comparisonResult);
  const setComparisonConfig = useDashboardStore((s) => s.setComparisonConfig);
  const runComparison = useDashboardStore((s) => s.runComparison);

  const sortedDates = useMemo(() => [...availableDates].sort().reverse(), [availableDates]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <GitCompareArrows className="w-4 h-4 text-slate-500" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Comparación</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <Select
          value={comparisonConfig.baseDate ?? undefined}
          onValueChange={(value) => setComparisonConfig({ baseDate: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Día base" />
          </SelectTrigger>
          <SelectContent>
            {sortedDates.map((date) => (
              <SelectItem key={`base-${date}`} value={date}>{date}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={comparisonConfig.targetDate ?? undefined}
          onValueChange={(value) => setComparisonConfig({ targetDate: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Día objetivo" />
          </SelectTrigger>
          <SelectContent>
            {sortedDates.map((date) => (
              <SelectItem key={`target-${date}`} value={date}>{date}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={comparisonConfig.periodMode}
          onValueChange={(value) => setComparisonConfig({ periodMode: value as ComparisonPeriodMode })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Modo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(periodLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {comparisonConfig.periodMode === 'shift' ? (
          <Select
            value={comparisonConfig.shift}
            onValueChange={(value) => setComparisonConfig({ shift: value as 'Día' | 'Noche' })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Día">Día</SelectItem>
              <SelectItem value="Noche">Noche</SelectItem>
            </SelectContent>
          </Select>
        ) : comparisonConfig.periodMode === 'custom_range' ? (
          <div className="col-span-1 xl:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="time"
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              value={comparisonConfig.startTime}
              onChange={(e) => setComparisonConfig({ startTime: e.target.value })}
            />
            <input
              type="time"
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
              value={comparisonConfig.endTime}
              onChange={(e) => setComparisonConfig({ endTime: e.target.value })}
            />
          </div>
        ) : (
          <div className="col-span-1 xl:col-span-2 text-[11px] text-slate-500 font-semibold flex items-center px-2">
            Se compara el período completo automáticamente.
          </div>
        )}

        <Button className="h-9" onClick={runComparison}>Comparar</Button>
      </div>

      {comparisonResult && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {comparisonResult.metrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
                  <span className="text-xs text-slate-400">{comparisonResult.config.periodMode === 'full_day' ? 'Día' : periodLabels[comparisonResult.config.periodMode]}</span>
                </div>
                <p className="text-lg font-black text-slate-900 mt-1">
                  {formatValue(metric.label, metric.baseValue)} → {formatValue(metric.label, metric.targetValue)}
                </p>
                <div className="mt-2 text-xs flex items-center gap-1 font-bold">
                  {metric.direction === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                  {metric.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                  {metric.direction === 'equal' && <Minus className="w-3 h-3 text-slate-500" />}
                  <span className={metric.direction === 'up' ? 'text-emerald-700' : metric.direction === 'down' ? 'text-red-700' : 'text-slate-600'}>
                    Δ {formatValue(metric.label, metric.delta)}
                    {metric.deltaPct !== null && ` (${metric.deltaPct.toFixed(1)}%)`}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
              Comparación por período (30 min)
            </div>
            <div className="max-h-56 overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-white sticky top-0">
                  <tr className="text-slate-500">
                    <th className="text-left px-3 py-2">Hora</th>
                    <th className="text-right px-3 py-2">Contestadas</th>
                    <th className="text-right px-3 py-2">Objetivo</th>
                    <th className="text-right px-3 py-2">Conv. base</th>
                    <th className="text-right px-3 py-2">Conv. obj.</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResult.slotDeltas.map((slot) => (
                    <tr key={slot.hora} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 font-semibold text-slate-700">{slot.hora}</td>
                      <td className="px-3 py-1.5 text-right">{slot.baseContestadas}</td>
                      <td className="px-3 py-1.5 text-right">{slot.targetContestadas}</td>
                      <td className="px-3 py-1.5 text-right">{slot.baseConversion.toFixed(1)}%</td>
                      <td className="px-3 py-1.5 text-right">{slot.targetConversion.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
