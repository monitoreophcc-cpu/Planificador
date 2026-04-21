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
  Wand2,
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  buildComparisonPeriodSummary,
  buildComparisonSelectionOptions,
  resolveComparisonRange,
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
import type {
  ComparisonConfig,
  ComparisonPeriodMode,
  ComparisonPreset,
} from '@/ui/reports/analysis-beta/types/dashboard.types';

const periodLabels: Record<ComparisonPeriodMode, string> = {
  full_day: 'Dia completo',
  shift: 'Por turno',
  custom_range: 'Rango horario',
  week: 'Semana completa',
  month: 'Mes completo',
  quarter: 'Trimestre completo',
};

const presetLabels: Record<Exclude<ComparisonPreset, 'manual'>, string> = {
  day_previous: 'Día anterior',
  week_previous: 'Semana anterior',
  month_previous: 'Mes anterior',
  quarter_previous: 'Trimestre anterior',
};

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDate(dateStr: string, days: number) {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function shiftUtcMonth(dateStr: string, months: number) {
  const date = parseDate(dateStr);
  date.setUTCMonth(date.getUTCMonth() + months);
  return formatDate(date);
}

function findLoadedDateInRange(
  availableDates: string[],
  start: string,
  end: string
): string | null {
  const matches = availableDates.filter((date) => date >= start && date <= end).sort();
  return matches[matches.length - 1] ?? null;
}

function formatValue(label: string, value: number): string {
  if (
    label === 'Nivel de servicio' ||
    label === '% Conversión' ||
    label === '% Abandono'
  ) {
    return `${value.toFixed(1)}%`;
  }

  if (label === 'Ventas válidas' || label === 'Ticket promedio') {
    return `RD$ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function buildPresetConfig(
  preset: Exclude<ComparisonPreset, 'manual'>,
  referenceDate: string,
  availableDates: string[]
): ComparisonConfig {
  if (preset === 'day_previous') {
    const ordered = [...availableDates].sort();
    const currentIndex = ordered.indexOf(referenceDate);
    const previousLoaded = currentIndex > 0 ? ordered[currentIndex - 1] : null;

    return {
      baseDate: previousLoaded ?? shiftUtcDate(referenceDate, -1),
      targetDate: referenceDate,
      periodMode: 'full_day',
      shift: 'Día',
      startTime: '09:00',
      endTime: '23:30',
    };
  }

  if (preset === 'week_previous') {
    const anchor = shiftUtcDate(referenceDate, -7);
    const range = resolveComparisonRange(anchor, 'week');

    return {
      baseDate: findLoadedDateInRange(availableDates, range.start, range.end) ?? anchor,
      targetDate: referenceDate,
      periodMode: 'week',
      shift: 'Día',
      startTime: '09:00',
      endTime: '23:30',
    };
  }

  if (preset === 'quarter_previous') {
    const anchor = shiftUtcMonth(referenceDate, -3);
    const range = resolveComparisonRange(anchor, 'quarter');

    return {
      baseDate: findLoadedDateInRange(availableDates, range.start, range.end) ?? anchor,
      targetDate: referenceDate,
      periodMode: 'quarter',
      shift: 'Día',
      startTime: '09:00',
      endTime: '23:30',
    };
  }

  const anchor = shiftUtcMonth(referenceDate, -1);
  const range = resolveComparisonRange(anchor, 'month');

  return {
    baseDate: findLoadedDateInRange(availableDates, range.start, range.end) ?? anchor,
    targetDate: referenceDate,
    periodMode: 'month',
    shift: 'Día',
    startTime: '09:00',
    endTime: '23:30',
  };
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
  const dataDate = useDashboardStore((s) => s.dataDate);
  const comparisonConfig = useDashboardStore((s) => s.comparisonConfig);
  const comparisonResult = useDashboardStore((s) => s.comparisonResult);
  const comparisonPreset = useDashboardStore((s) => s.comparisonPreset);
  const setComparisonConfig = useDashboardStore((s) => s.setComparisonConfig);
  const setComparisonPreset = useDashboardStore((s) => s.setComparisonPreset);
  const runComparison = useDashboardStore((s) => s.runComparison);

  const sortedDates = useMemo(() => [...availableDates].sort().reverse(), [availableDates]);
  const hasEnoughDates = sortedDates.length >= 2;
  const referenceDate = dataDate ?? sortedDates[0] ?? null;
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
    comparisonConfig.periodMode === 'week' ||
    comparisonConfig.periodMode === 'month' ||
    comparisonConfig.periodMode === 'quarter';
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
        : comparisonConfig.periodMode === 'quarter'
          ? 'Trimestre'
        : 'Fecha';

  const handlePreset = (preset: Exclude<ComparisonPreset, 'manual'>) => {
    if (!referenceDate) {
      return;
    }

    const nextConfig = buildPresetConfig(preset, referenceDate, availableDates);
    setComparisonPreset(preset);
    setComparisonConfig(nextConfig);
    runComparison();
  };

  const handleManualCompare = () => {
    setComparisonPreset('manual');
    runComparison();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!hasEnoughDates}
          className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-left hover:bg-slate-50"
        >
          <GitCompareArrows className="h-4 w-4 text-slate-500" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Comparar
            </span>
            <span className="text-[11px] font-black text-slate-900">
              {comparisonResult ? 'Resultado listo' : 'Abrir comparación'}
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
            {comparisonPreset !== 'manual'
              ? presetLabels[comparisonPreset]
              : comparisonResult
                ? resultModeLabel
                : `${sortedDates.length} dias`}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[1080px] overflow-hidden rounded-[2rem] bg-white p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
            <GitCompareArrows className="h-5 w-5 text-red-600" />
            Comparación entre periodos
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Usa presets rápidos para comparar contra el día, la semana, el mes o el trimestre anterior, o baja al modo avanzado cuando necesites más control.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {!hasEnoughDates ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Carga al menos dos fechas para habilitar la comparación.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Presets rápidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(presetLabels) as Array<Exclude<ComparisonPreset, 'manual'>>).map(
                        (preset) => (
                          <Button
                            key={preset}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'rounded-xl border border-transparent bg-white px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 shadow-sm hover:bg-white',
                              comparisonPreset === preset && 'border-red-200 text-red-600'
                            )}
                            onClick={() => handlePreset(preset)}
                          >
                            <Wand2 className="h-4 w-4" />
                            {presetLabels[preset]}
                          </Button>
                        )
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Referencia activa:{' '}
                      <span className="font-black text-slate-700">
                        {referenceDate ?? 'Sin fecha seleccionada'}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 xl:max-w-sm">
                    Si cargas archivos con varias fechas, cada día se acumula por separado y aquí se agrupa automáticamente por semana, mes o trimestre.
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
                    onClick={handleManualCompare}
                    disabled={!comparisonConfig.baseDate || !comparisonConfig.targetDate}
                  >
                    Comparar
                  </Button>
                </div>
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
                    La comparación usa solo los días cargados en el historial. Si la cobertura es menor a la esperada, el total mostrado es parcial.
                  </p>
                </div>
              ) : null}

              {comparisonResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                            Delta {formatValue(metric.label, Math.abs(metric.delta))}
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
                    Usa un preset rápido o configura el modo avanzado para ver el resultado.
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
