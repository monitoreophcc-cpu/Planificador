import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
  ComparisonConfig,
  ComparisonMetric,
  ComparisonPeriodMode,
  ComparisonPeriodSummary,
  ComparisonResult,
  Shift,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import { aggregateByTimeSlot, calculateGlobalKpis } from './kpi.service';
import { getShift } from './shift.service';

type DailyDataset = {
  answered: AnsweredCall[];
  abandoned: AbandonedCall[];
  transactions: Transaction[];
};

export type ComparisonSelectionOption = {
  value: string;
  label: string;
  summary: ComparisonPeriodSummary;
};

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMonthYear(dateStr: string): string {
  const date = parseDate(dateStr);
  return new Intl.DateTimeFormat('es-DO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function getWeekRange(dateStr: string): { start: string; end: string } {
  const date = parseDate(dateStr);
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
}

function getMonthRange(dateStr: string): { start: string; end: string } {
  const date = parseDate(dateStr);
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(y, m + 1, 0));
  return { start: formatDate(first), end: formatDate(last) };
}

function getExpectedDays(start: string, end: string): number {
  const diff = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

function buildPeriodLabel(
  periodMode: ComparisonPeriodMode,
  range: { start: string; end: string }
): string {
  if (periodMode === 'month') {
    return formatMonthYear(range.start);
  }

  if (periodMode === 'week') {
    return `${range.start} a ${range.end}`;
  }

  return range.start;
}

export function resolveComparisonRange(
  dateStr: string,
  periodMode: ComparisonPeriodMode
): { start: string; end: string } {
  if (periodMode === 'week') return getWeekRange(dateStr);
  if (periodMode === 'month') return getMonthRange(dateStr);
  return { start: dateStr, end: dateStr };
}

export function buildComparisonPeriodSummary(params: {
  anchorDate: string;
  periodMode: ComparisonPeriodMode;
  loadedDates: string[];
}): ComparisonPeriodSummary {
  const range = resolveComparisonRange(params.anchorDate, params.periodMode);
  const loadedDays = params.loadedDates.filter(
    (date) => date >= range.start && date <= range.end
  ).length;
  const expectedDays = getExpectedDays(range.start, range.end);

  return {
    label: buildPeriodLabel(params.periodMode, range),
    start: range.start,
    end: range.end,
    loadedDays,
    expectedDays,
    isComplete: loadedDays >= expectedDays,
  };
}

export function buildComparisonSelectionOptions(params: {
  availableDates: string[];
  periodMode: ComparisonPeriodMode;
}): ComparisonSelectionOption[] {
  const sortedDates = [...new Set(params.availableDates)].sort();

  if (
    params.periodMode === 'full_day' ||
    params.periodMode === 'shift' ||
    params.periodMode === 'custom_range'
  ) {
    return [...sortedDates]
      .sort()
      .reverse()
      .map((date) => ({
        value: date,
        label: date,
        summary: buildComparisonPeriodSummary({
          anchorDate: date,
          periodMode: params.periodMode,
          loadedDates: sortedDates,
        }),
      }));
  }

  const grouped = new Map<string, ComparisonSelectionOption>();

  sortedDates.forEach((date) => {
    const summary = buildComparisonPeriodSummary({
      anchorDate: date,
      periodMode: params.periodMode,
      loadedDates: sortedDates,
    });
    const key = `${summary.start}:${summary.end}`;

    if (grouped.has(key)) {
      return;
    }

    const label =
      params.periodMode === 'week'
        ? `Semana ${summary.start} a ${summary.end} · ${summary.loadedDays}/${summary.expectedDays} dias`
        : `${summary.label} · ${summary.loadedDays}/${summary.expectedDays} dias`;

    grouped.set(key, {
      value: date,
      label,
      summary,
    });
  });

  return [...grouped.values()].sort((left, right) =>
    right.summary.start.localeCompare(left.summary.start)
  );
}

export function resolveComparisonSelectionValue(params: {
  selectedDate: string | null;
  options: ComparisonSelectionOption[];
  periodMode: ComparisonPeriodMode;
}): string | undefined {
  const selectedDate = params.selectedDate;

  if (!selectedDate) {
    return undefined;
  }

  if (
    params.periodMode === 'full_day' ||
    params.periodMode === 'shift' ||
    params.periodMode === 'custom_range'
  ) {
    return params.options.find((option) => option.value === params.selectedDate)?.value;
  }

  return params.options.find(
    (option) =>
      selectedDate >= option.summary.start &&
      selectedDate <= option.summary.end
  )?.value;
}

function safeDeltaPct(baseValue: number, delta: number): number | null {
  if (baseValue === 0) return null;
  return (delta / baseValue) * 100;
}

function metric(label: string, baseValue: number, targetValue: number): ComparisonMetric {
  const delta = targetValue - baseValue;
  return {
    label,
    baseValue,
    targetValue,
    delta,
    deltaPct: safeDeltaPct(baseValue, delta),
    direction: delta === 0 ? 'equal' : delta > 0 ? 'up' : 'down',
  };
}

function inTimeRange(hora: string, startTime: string, endTime: string): boolean {
  if (!hora) return false;
  const hhmm = hora.slice(0, 5);
  return hhmm >= startTime && hhmm <= endTime;
}

function applyPeriodFilter(dataset: DailyDataset, config: ComparisonConfig): DailyDataset {
  if (config.periodMode === 'full_day') {
    return dataset;
  }

  if (config.periodMode === 'shift') {
    const shift: Shift = config.shift;
    return {
      answered: dataset.answered.filter((r) => r.turno === shift),
      abandoned: dataset.abandoned.filter((r) => r.turno === shift),
      transactions: dataset.transactions.filter((r) => getShift(r.hora) === shift),
    };
  }

  if (config.periodMode === 'week' || config.periodMode === 'month') {
    return dataset;
  }

  return {
    answered: dataset.answered.filter((r) => inTimeRange(r.hora, config.startTime, config.endTime)),
    abandoned: dataset.abandoned.filter((r) => inTimeRange(r.hora, config.startTime, config.endTime)),
    transactions: dataset.transactions.filter((r) => inTimeRange(r.hora, config.startTime, config.endTime)),
  };
}

export function buildComparisonResult(params: {
  config: ComparisonConfig;
  allAnswered: AnsweredCall[];
  allAbandoned: AbandonedCall[];
  allTransactions: Transaction[];
}): ComparisonResult | null {
  const { config, allAnswered, allAbandoned, allTransactions } = params;

  if (!config.baseDate || !config.targetDate) return null;
  const loadedDates = [
    ...new Set([
      ...allAnswered.map((record) => record.fecha),
      ...allAbandoned.map((record) => record.fecha),
      ...allTransactions.map((record) => record.fecha),
    ]),
  ];
  const baseRange = resolveComparisonRange(config.baseDate, config.periodMode);
  const targetRange = resolveComparisonRange(config.targetDate, config.periodMode);
  const basePeriod = buildComparisonPeriodSummary({
    anchorDate: config.baseDate,
    periodMode: config.periodMode,
    loadedDates,
  });
  const targetPeriod = buildComparisonPeriodSummary({
    anchorDate: config.targetDate,
    periodMode: config.periodMode,
    loadedDates,
  });

  const baseDay = applyPeriodFilter(
    {
      answered: allAnswered.filter((r) => r.fecha >= baseRange.start && r.fecha <= baseRange.end),
      abandoned: allAbandoned.filter((r) => r.fecha >= baseRange.start && r.fecha <= baseRange.end),
      transactions: allTransactions.filter((r) => r.fecha >= baseRange.start && r.fecha <= baseRange.end),
    },
    config
  );

  const targetDay = applyPeriodFilter(
    {
      answered: allAnswered.filter((r) => r.fecha >= targetRange.start && r.fecha <= targetRange.end),
      abandoned: allAbandoned.filter((r) => r.fecha >= targetRange.start && r.fecha <= targetRange.end),
      transactions: allTransactions.filter((r) => r.fecha >= targetRange.start && r.fecha <= targetRange.end),
    },
    config
  );

  const baseKpis = calculateGlobalKpis(baseDay.answered, baseDay.abandoned, baseDay.transactions);
  const targetKpis = calculateGlobalKpis(targetDay.answered, targetDay.abandoned, targetDay.transactions);

  const metrics: ComparisonMetric[] = [
    metric('Recibidas', baseKpis.recibidas, targetKpis.recibidas),
    metric('Contestadas', baseKpis.contestadas, targetKpis.contestadas),
    metric('Abandonadas', baseKpis.abandonadas, targetKpis.abandonadas),
    metric('Nivel de servicio', baseKpis.nivelDeServicio, targetKpis.nivelDeServicio),
    metric('Conversión', baseKpis.conversion, targetKpis.conversion),
    metric('Transacciones CC', baseKpis.transaccionesCC, targetKpis.transaccionesCC),
  ];

  const baseSlotsAgg = aggregateByTimeSlot(baseDay.answered, baseDay.abandoned, baseDay.transactions);
  const targetSlotsAgg = aggregateByTimeSlot(targetDay.answered, targetDay.abandoned, targetDay.transactions);

  const mergedSlots =
    config.periodMode === 'shift'
      ? config.shift === 'Día'
        ? baseSlotsAgg.day.map((slot, index) => ({
            hora: slot.hora,
            baseContestadas: slot.contestadas,
            targetContestadas: targetSlotsAgg.day[index]?.contestadas ?? 0,
            baseConversion: slot.conversionRate,
            targetConversion: targetSlotsAgg.day[index]?.conversionRate ?? 0,
          }))
        : baseSlotsAgg.night.map((slot, index) => ({
            hora: slot.hora,
            baseContestadas: slot.contestadas,
            targetContestadas: targetSlotsAgg.night[index]?.contestadas ?? 0,
            baseConversion: slot.conversionRate,
            targetConversion: targetSlotsAgg.night[index]?.conversionRate ?? 0,
          }))
      : [...baseSlotsAgg.day, ...baseSlotsAgg.night].map((slot, index) => {
          const target = [...targetSlotsAgg.day, ...targetSlotsAgg.night][index];
          return {
            hora: slot.hora,
            baseContestadas: slot.contestadas,
            targetContestadas: target?.contestadas ?? 0,
            baseConversion: slot.conversionRate,
            targetConversion: target?.conversionRate ?? 0,
          };
        });

  const slotDeltas =
    config.periodMode === 'custom_range'
      ? mergedSlots.filter((slot) => inTimeRange(`${slot.hora}:00`, config.startTime, config.endTime))
      : mergedSlots;

  return {
    generatedAt: new Date().toISOString(),
    config: { ...config },
    basePeriod,
    targetPeriod,
    metrics,
    slotDeltas,
  };
}
