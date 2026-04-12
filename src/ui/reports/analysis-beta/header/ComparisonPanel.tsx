'use client';

import { useMemo } from 'react';
import {
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  CalendarRange,
  AlertTriangle,
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  buildComparisonPeriodSummary,
  buildComparisonSelectionOptions,
  resolveComparisonSelectionValue,
} from '@/ui/reports/analysis-beta/services/comparison.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/reports/analysis-beta/ui/select';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/reports/analysis-beta/ui/dialog';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import type { ComparisonPeriodMode } from '@/ui/reports/analysis-beta/types/dashboard.types';

const periodLabels: Record<ComparisonPeriodMode, string> = {
  full_day: 'Dia completo',
  shift: 'Por turno',
  custom_range: 'Rango horario',
  week: 'Semana completa',
  month: 'Mes completo',
};

function formatValue(label: string, value: number): string {
  if (label === 'Nivel de servicio' || label === 'Conversión') {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function PeriodSummaryCard({
  title,
  label,
  range,
  loadedDays,
  expectedDays,
  isComplete,
}: {
  title: string;
  label: string;
  range: string;
  loadedDays: number;
  expectedDays: number;
  isComplete: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em]',
            isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          )}
        >
          {loadedDays}/{expectedDays} dias
        </span>
      </div>
      <p className="mt-3 text-sm font-black text-slate-900">{label}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{range}</p>
    </article>
  );
}

export default function ComparisonPanel() {
  const availableDates = useDashboardStore((s) => s.availableDates);
  const comparisonConfig = useDashboardStore((s) => s.comparisonConfig);
  const comparisonResult = useDashboardStore((s) => s.comparisonResult);
  const setComparisonConfig = useDashboardStore((s) => s.setComparisonConfig);
  const runComparison = useDashboardStore((s) => s.runComparison);

  const sortedDates = useMemo(() => [...availableDates].sort().reverse(), [availableDates]);
  const hasEnoughDates = sortedDates.length >= 2;
  const periodOptions = useMemo(
    () =>
      buildComparisonSelectionOptions({
        availableDates,
        periodMode: comparisonConfig.periodMode,
      }),
    [availableDates, comparisonConfig.periodMode]
  );
  const baseSelectValue = useMemo(
    () =>
      resolveComparisonSelectionValue({
        selectedDate: comparisonConfig.baseDate,
        options: periodOptions,
        periodMode: comparisonConfig.periodMode,
      }),
    [comparisonConfig.baseDate, comparisonConfig.periodMode, periodOptions]
  );
  const targetSelectValue = useMemo(
    () =>
      resolveComparisonSelectionValue({
        selectedDate: comparisonConfig.targetDate,
        options: periodOptions,
        periodMode: comparisonConfig.periodMode,
      }),
    [comparisonConfig.periodMode, comparisonConfig.targetDate, periodOptions]
  );
  const basePreview = useMemo(
    () =>
      comparisonConfig.baseDate
        ? buildComparisonPeriodSummary({
            anchorDate: comparisonConfig.baseDate,
            periodMode: comparisonConfig.periodMode,
            loadedDates: availableDates,
          })
        : null,
    [availableDates, comparisonConfig.baseDate, comparisonConfig.periodMode]
  );
  const targetPreview = useMemo(
    () =>
      comparisonConfig.targetDate
        ? buildComparisonPeriodSummary({
            anchorDate: comparisonConfig.targetDate,
            periodMode: comparisonConfig.periodMode,
            loadedDates: availableDates,
          })
        : null,
    [availableDates, comparisonConfig.periodMode, comparisonConfig.targetDate]
  );
  const basePeriod = comparisonResult?.basePeriod ?? basePreview;
  const targetPeriod = comparisonResult?.targetPeriod ?? targetPreview;
  const isMultiDayMode =
    comparisonConfig.periodMode === 'week' || comparisonConfig.periodMode === 'month';
  const showCoverageWarning =
    isMultiDayMode &&
    Boolean(
      (basePeriod && !basePeriod.isComplete) || (targetPeriod && !targetPeriod.isComplete)
    );
  const resultModeLabel = comparisonResult
    ? periodLabels[comparisonResult.config.periodMode]
    : periodLabels[comparisonConfig.periodMode];
  const selectionNoun =
    comparisonConfig.periodMode === 'week'
      ? 'Semana'
      : comparisonConfig.periodMode === 'month'
        ? 'Mes'
        : 'Fecha';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!hasEnoughDates}
          className="h-9 rounded-xl border-slate-200 bg-white px-3 text-left hover:bg-slate-50"
        >
          <GitCompareArrows className="h-4 w-4 text-slate-500" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Comparación
            </span>
            <span className="text-[11px] font-black text-slate-900">
              {comparisonResult ? 'Resultado listo' : 'Comparar periodos'}
            </span>
          </span>
          <span
            className={cn(
              'ml-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]',
              comparisonResult
                ? 'bg-red-50 text-red-600'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            {comparisonResult ? resultModeLabel : `${sortedDates.length} dias`}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[960px] overflow-hidden rounded-2xl bg-white p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
            <GitCompareArrows className="h-5 w-5 text-red-600" />
            Comparación entre periodos
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Compara días, turnos, rangos horarios, semanas completas o meses completos sin invadir la vista principal.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {!hasEnoughDates ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Carga al menos dos fechas para habilitar la comparación.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <Select
                    value={baseSelectValue}
                    onValueChange={(value) => setComparisonConfig({ baseDate: value })}
                  >
                    <SelectTrigger className="h-10 bg-white text-xs font-bold">
                      <SelectValue placeholder={`${selectionNoun} base`} />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={`base-${option.summary.start}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={targetSelectValue}
                    onValueChange={(value) => setComparisonConfig({ targetDate: value })}
                  >
                    <SelectTrigger className="h-10 bg-white text-xs font-bold">
                      <SelectValue placeholder={`${selectionNoun} objetivo`} />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={`target-${option.summary.start}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={comparisonConfig.periodMode}
                    onValueChange={(value) =>
                      setComparisonConfig({ periodMode: value as ComparisonPeriodMode })
                    }
                  >
                    <SelectTrigger className="h-10 bg-white text-xs font-bold">
                      <SelectValue placeholder="Modo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(periodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {comparisonConfig.periodMode === 'shift' ? (
                    <Select
                      value={comparisonConfig.shift}
                      onValueChange={(value) =>
                        setComparisonConfig({ shift: value as 'Día' | 'Noche' })
                      }
                    >
                      <SelectTrigger className="h-10 bg-white text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Día">Dia</SelectItem>
                        <SelectItem value="Noche">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : comparisonConfig.periodMode === 'custom_range' ? (
                    <div className="grid grid-cols-2 gap-2 xl:col-span-2">
                      <input
                        type="time"
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                        value={comparisonConfig.startTime}
                        onChange={(e) => setComparisonConfig({ startTime: e.target.value })}
                      />
                      <input
                        type="time"
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                        value={comparisonConfig.endTime}
                        onChange={(e) => setComparisonConfig({ endTime: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 xl:col-span-2">
                      Periodo completo automatico
                    </div>
                  )}

                  <Button
                    className="h-10 rounded-xl bg-red-600 text-xs font-black uppercase tracking-[0.16em] hover:bg-red-700"
                    onClick={runComparison}
                    disabled={!comparisonConfig.baseDate || !comparisonConfig.targetDate}
                  >
                    Comparar
                  </Button>
                </div>

                {isMultiDayMode ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
                    Si cargas archivos con varias fechas, cada día se acumula por separado en el historial y aquí se agrupa automáticamente por semana o por mes.
                  </div>
                ) : null}
              </div>

              {basePeriod || targetPeriod ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {basePeriod ? (
                    <PeriodSummaryCard
                      title="Periodo base"
                      label={basePeriod.label}
                      range={`${basePeriod.start} a ${basePeriod.end}`}
                      loadedDays={basePeriod.loadedDays}
                      expectedDays={basePeriod.expectedDays}
                      isComplete={basePeriod.isComplete}
                    />
                  ) : null}
                  {targetPeriod ? (
                    <PeriodSummaryCard
                      title="Periodo objetivo"
                      label={targetPeriod.label}
                      range={`${targetPeriod.start} a ${targetPeriod.end}`}
                      loadedDays={targetPeriod.loadedDays}
                      expectedDays={targetPeriod.expectedDays}
                      isComplete={targetPeriod.isComplete}
                    />
                  ) : null}
                </div>
              ) : null}

              {showCoverageWarning ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    La comparación usa solo los días que ya están cargados en el historial. Si ves menos días de los esperados, el total será parcial.
                  </p>
                </div>
              ) : null}

              {comparisonResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {comparisonResult.metrics.map((metric) => (
                      <article
                        key={metric.label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {metric.label}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            {periodLabels[comparisonResult.config.periodMode]}
                          </span>
                        </div>

                        <p className="mt-2 text-lg font-black text-slate-900">
                          {formatValue(metric.label, metric.baseValue)} -{' '}
                          {formatValue(metric.label, metric.targetValue)}
                        </p>

                        <div className="mt-3 flex items-center gap-1 text-xs font-bold">
                          {metric.direction === 'up' && (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          {metric.direction === 'down' && (
                            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                          )}
                          {metric.direction === 'equal' && (
                            <Minus className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          <span
                            className={cn(
                              metric.direction === 'up'
                                ? 'text-emerald-700'
                                : metric.direction === 'down'
                                  ? 'text-red-700'
                                  : 'text-slate-600'
                            )}
                          >
                            Delta {formatValue(metric.label, metric.delta)}
                            {metric.deltaPct !== null && ` (${metric.deltaPct.toFixed(1)}%)`}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Comparación por periodo (30 min)
                    </div>
                    <div className="max-h-[320px] overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-slate-100 text-slate-500">
                            <th className="px-4 py-3 text-left font-black uppercase tracking-[0.14em]">
                              Hora
                            </th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em]">
                              Base
                            </th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em]">
                              Objetivo
                            </th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em]">
                              Conv. base
                            </th>
                            <th className="px-4 py-3 text-right font-black uppercase tracking-[0.14em]">
                              Conv. obj.
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonResult.slotDeltas.map((slot) => (
                            <tr key={slot.hora} className="border-t border-slate-100">
                              <td className="px-4 py-2.5 font-bold text-slate-700">
                                {slot.hora}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-700">
                                {slot.baseContestadas.toLocaleString('en-US')}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-700">
                                {slot.targetContestadas.toLocaleString('en-US')}
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-700">
                                {slot.baseConversion.toFixed(1)}%
                              </td>
                              <td className="px-4 py-2.5 text-right text-slate-700">
                                {slot.targetConversion.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    Configura los periodos y presiona comparar para ver el resultado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
