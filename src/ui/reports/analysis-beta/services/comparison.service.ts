import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
  ComparisonConfig,
  ComparisonMetric,
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

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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

  const getDateRange = (date: string) => {
    if (config.periodMode === 'week') return getWeekRange(date);
    if (config.periodMode === 'month') return getMonthRange(date);
    return { start: date, end: date };
  };

  const baseRange = getDateRange(config.baseDate);
  const targetRange = getDateRange(config.targetDate);

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
    config,
    metrics,
    slotDeltas,
  };
}
