import type {
  AnsweredCall,
  AbandonedCall,
  DailySnapshot,
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

type SnapshotAggregate = {
  kpis: {
    recibidas: number;
    contestadas: number;
    abandonadas: number;
    transaccionesCC: number;
    ventasValidas: number;
  };
  slots: Array<{
    hora: string;
    contestadas: number;
    conversionRate: number;
  }>;
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

function buildSnapshotComparisonMetric(
  label: string,
  baseValue: number,
  targetValue: number
): ComparisonMetric {
  return metric(label, baseValue, targetValue);
}

function mergeOperationalSlots(
  snapshots: DailySnapshot[]
): SnapshotAggregate['slots'] {
  const slots = new Map<
    string,
    {
      contestadas: number;
      transacciones: number;
    }
  >();

  snapshots.forEach((snapshot) => {
    [...snapshot.operationalDetail.day, ...snapshot.operationalDetail.night].forEach(
      (slot) => {
        const current = slots.get(slot.hora) ?? {
          contestadas: 0,
          transacciones: 0,
        };

        current.contestadas += slot.contestadas;
        current.transacciones += slot.transacciones;
        slots.set(slot.hora, current);
      }
    );
  });

  return [...slots.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([hora, values]) => ({
      hora,
      contestadas: values.contestadas,
      conversionRate:
        values.contestadas > 0
          ? (values.transacciones / values.contestadas) * 100
          : 0,
    }));
}

function aggregateSnapshotsByRange(params: {
  dailyHistory: Record<string, DailySnapshot>;
  start: string;
  end: string;
}): SnapshotAggregate {
  const snapshots = Object.keys(params.dailyHistory)
    .filter((date) => date >= params.start && date <= params.end)
    .sort()
    .map((date) => params.dailyHistory[date])
    .filter((snapshot): snapshot is DailySnapshot => Boolean(snapshot));

  const totals = snapshots.reduce(
    (accumulator, snapshot) => {
      accumulator.recibidas += snapshot.kpis.recibidas;
      accumulator.contestadas += snapshot.kpis.contestadas;
      accumulator.abandonadas += snapshot.kpis.abandonadas;
      accumulator.transaccionesCC += snapshot.kpis.transaccionesCC;
      accumulator.ventasValidas += snapshot.kpis.ventasValidas;
      return accumulator;
    },
    {
      recibidas: 0,
      contestadas: 0,
      abandonadas: 0,
      transaccionesCC: 0,
      ventasValidas: 0,
    }
  );

  return {
    kpis: totals,
    slots: mergeOperationalSlots(snapshots),
  };
}

function buildComparisonResultFromSnapshots(params: {
  config: ComparisonConfig;
  dailyHistory: Record<string, DailySnapshot>;
}): ComparisonResult | null {
  const { config, dailyHistory } = params;

  if (!config.baseDate || !config.targetDate) {
    return null;
  }

  if (
    config.periodMode === 'shift' ||
    config.periodMode === 'custom_range'
  ) {
    return null;
  }

  const loadedDates = Object.keys(dailyHistory);
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
  const baseAggregate = aggregateSnapshotsByRange({
    dailyHistory,
    start: baseRange.start,
    end: baseRange.end,
  });
  const targetAggregate = aggregateSnapshotsByRange({
    dailyHistory,
    start: targetRange.start,
    end: targetRange.end,
  });
  const baseTicket =
    baseAggregate.kpis.transaccionesCC > 0
      ? baseAggregate.kpis.ventasValidas / baseAggregate.kpis.transaccionesCC
      : 0;
  const targetTicket =
    targetAggregate.kpis.transaccionesCC > 0
      ? targetAggregate.kpis.ventasValidas / targetAggregate.kpis.transaccionesCC
      : 0;
  const baseAbandonmentRate =
    baseAggregate.kpis.recibidas > 0
      ? (baseAggregate.kpis.abandonadas / baseAggregate.kpis.recibidas) * 100
      : 0;
  const targetAbandonmentRate =
    targetAggregate.kpis.recibidas > 0
      ? (targetAggregate.kpis.abandonadas / targetAggregate.kpis.recibidas) * 100
      : 0;
  const baseConversion =
    baseAggregate.kpis.contestadas > 0
      ? (baseAggregate.kpis.transaccionesCC / baseAggregate.kpis.contestadas) * 100
      : 0;
  const targetConversion =
    targetAggregate.kpis.contestadas > 0
      ? (targetAggregate.kpis.transaccionesCC / targetAggregate.kpis.contestadas) * 100
      : 0;
  const slotMap = new Map<
    string,
    {
      baseContestadas: number;
      targetContestadas: number;
      baseConversion: number;
      targetConversion: number;
    }
  >();

  baseAggregate.slots.forEach((slot) => {
    const current = slotMap.get(slot.hora) ?? {
      baseContestadas: 0,
      targetContestadas: 0,
      baseConversion: 0,
      targetConversion: 0,
    };

    current.baseContestadas = slot.contestadas;
    current.baseConversion = slot.conversionRate;
    slotMap.set(slot.hora, current);
  });

  targetAggregate.slots.forEach((slot) => {
    const current = slotMap.get(slot.hora) ?? {
      baseContestadas: 0,
      targetContestadas: 0,
      baseConversion: 0,
      targetConversion: 0,
    };

    current.targetContestadas = slot.contestadas;
    current.targetConversion = slot.conversionRate;
    slotMap.set(slot.hora, current);
  });

  return {
    generatedAt: new Date().toISOString(),
    config: { ...config },
    basePeriod,
    targetPeriod,
    metrics: [
      buildSnapshotComparisonMetric(
        'Recibidas',
        baseAggregate.kpis.recibidas,
        targetAggregate.kpis.recibidas
      ),
      buildSnapshotComparisonMetric(
        'Contestadas',
        baseAggregate.kpis.contestadas,
        targetAggregate.kpis.contestadas
      ),
      buildSnapshotComparisonMetric(
        'Nivel de servicio',
        baseAggregate.kpis.recibidas > 0
          ? (baseAggregate.kpis.contestadas / baseAggregate.kpis.recibidas) * 100
          : 0,
        targetAggregate.kpis.recibidas > 0
          ? (targetAggregate.kpis.contestadas / targetAggregate.kpis.recibidas) * 100
          : 0
      ),
      buildSnapshotComparisonMetric(
        '% Abandono',
        baseAbandonmentRate,
        targetAbandonmentRate
      ),
      buildSnapshotComparisonMetric('% Conversión', baseConversion, targetConversion),
      buildSnapshotComparisonMetric(
        'Transacciones CC',
        baseAggregate.kpis.transaccionesCC,
        targetAggregate.kpis.transaccionesCC
      ),
      buildSnapshotComparisonMetric(
        'Ventas válidas',
        baseAggregate.kpis.ventasValidas,
        targetAggregate.kpis.ventasValidas
      ),
      buildSnapshotComparisonMetric('Ticket promedio', baseTicket, targetTicket),
    ],
    slotDeltas: [...slotMap.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([hora, values]) => ({
        hora,
        baseContestadas: values.baseContestadas,
        targetContestadas: values.targetContestadas,
        baseConversion: values.baseConversion,
        targetConversion: values.targetConversion,
      })),
  };
}

export function buildComparisonResult(params: {
  config: ComparisonConfig;
  allAnswered: AnsweredCall[];
  allAbandoned: AbandonedCall[];
  allTransactions: Transaction[];
  dailyHistory?: Record<string, DailySnapshot>;
}): ComparisonResult | null {
  const { config, allAnswered, allAbandoned, allTransactions, dailyHistory } = params;

  if (!config.baseDate || !config.targetDate) return null;
  const hasRawHistory =
    allAnswered.length > 0 || allAbandoned.length > 0 || allTransactions.length > 0;
  const canUseSnapshotFallback =
    Boolean(dailyHistory) &&
    (config.periodMode === 'full_day' ||
      config.periodMode === 'week' ||
      config.periodMode === 'month');

  const rawLoadedDates = [
    ...new Set([
      ...allAnswered.map((record) => record.fecha),
      ...allAbandoned.map((record) => record.fecha),
      ...allTransactions.map((record) => record.fecha),
    ]),
  ];
  const snapshotLoadedDates = Object.keys(dailyHistory ?? {});

  if (canUseSnapshotFallback) {
    const rawBaseCoverage = buildComparisonPeriodSummary({
      anchorDate: config.baseDate,
      periodMode: config.periodMode,
      loadedDates: rawLoadedDates,
    });
    const rawTargetCoverage = buildComparisonPeriodSummary({
      anchorDate: config.targetDate,
      periodMode: config.periodMode,
      loadedDates: rawLoadedDates,
    });
    const snapshotBaseCoverage = buildComparisonPeriodSummary({
      anchorDate: config.baseDate,
      periodMode: config.periodMode,
      loadedDates: snapshotLoadedDates,
    });
    const snapshotTargetCoverage = buildComparisonPeriodSummary({
      anchorDate: config.targetDate,
      periodMode: config.periodMode,
      loadedDates: snapshotLoadedDates,
    });

    if (
      !hasRawHistory ||
      rawBaseCoverage.loadedDays < snapshotBaseCoverage.loadedDays ||
      rawTargetCoverage.loadedDays < snapshotTargetCoverage.loadedDays
    ) {
      return buildComparisonResultFromSnapshots({
        config,
        dailyHistory: dailyHistory ?? {},
      });
    }
  }

  const loadedDates = [
    ...rawLoadedDates,
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
  const baseAbandonmentRate =
    baseKpis.recibidas > 0 ? (baseKpis.abandonadas / baseKpis.recibidas) * 100 : 0;
  const targetAbandonmentRate =
    targetKpis.recibidas > 0 ? (targetKpis.abandonadas / targetKpis.recibidas) * 100 : 0;

  const metrics: ComparisonMetric[] = [
    metric('Recibidas', baseKpis.recibidas, targetKpis.recibidas),
    metric('Contestadas', baseKpis.contestadas, targetKpis.contestadas),
    metric('Nivel de servicio', baseKpis.nivelDeServicio, targetKpis.nivelDeServicio),
    metric('% Abandono', baseAbandonmentRate, targetAbandonmentRate),
    metric('% Conversión', baseKpis.conversion, targetKpis.conversion),
    metric('Transacciones CC', baseKpis.transaccionesCC, targetKpis.transaccionesCC),
    metric('Ventas válidas', baseKpis.ventasValidas, targetKpis.ventasValidas),
    metric('Ticket promedio', baseKpis.ticketPromedio, targetKpis.ticketPromedio),
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
