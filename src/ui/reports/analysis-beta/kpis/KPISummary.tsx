'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Percent,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  ShoppingCart,
  Target,
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import {
  buildKpiDeltas,
  getPreviousSnapshot,
} from '@/ui/reports/analysis-beta/services/executive.service';

const KPI_ICONS: Record<string, LucideIcon> = {
  'Total Recibidas': PhoneIncoming,
  'Total Contestadas': PhoneCall,
  'Total Abandonadas': PhoneOff,
  '% Atención': Target,
  '% Abandono': Percent,
  'Transacciones CC': ShoppingCart,
  '% Conversión': CreditCard,
};

function formatValue(value: number, format: 'number' | 'percent' | 'currency') {
  if (format === 'currency') {
    return `RD$ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  }

  return value.toLocaleString('en-US');
}

function getValueTone(label: string, value: number) {
  if (label === '% Atención') {
    if (value >= 96) return 'text-emerald-700';
    if (value >= 92) return 'text-amber-600';
    return 'text-red-700';
  }

  if (label === '% Abandono') {
    if (value <= 4) return 'text-emerald-700';
    if (value < 8) return 'text-amber-600';
    return 'text-red-700';
  }

  return 'text-slate-900';
}

function getDeltaTone(label: string, delta: number | null) {
  if (delta == null || delta === 0) {
    return {
      label: 'Sin variación',
      className: 'bg-slate-100 text-slate-500',
      Icon: null,
    };
  }

  const lowerIsBetter = label === '% Abandono';
  const improved = lowerIsBetter ? delta < 0 : delta > 0;

  return improved
    ? {
        label: 'Mejora vs. fecha previa',
        className: 'bg-emerald-50 text-emerald-700',
        Icon: ArrowUpRight,
      }
    : {
        label: 'Retroceso vs. fecha previa',
        className: 'bg-red-50 text-red-700',
        Icon: ArrowDownRight,
      };
}

export default function KPISummary() {
  const selectedDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const currentSnapshot = selectedDate ? dailyHistory[selectedDate] ?? null : null;
  const previousSnapshot = getPreviousSnapshot(dailyHistory, selectedDate);
  const deltas = buildKpiDeltas({
    current: currentSnapshot,
    previous: previousSnapshot,
  });

  if (!currentSnapshot || deltas.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      {deltas.map((delta) => {
        const Icon = KPI_ICONS[delta.label] ?? Percent;
        const deltaTone = getDeltaTone(delta.label, delta.delta);

        return (
          <article
            key={delta.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {delta.label}
                </p>
                <p className={cn('text-3xl font-black leading-none', getValueTone(delta.label, delta.currentValue))}>
                  {formatValue(delta.currentValue, delta.format)}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
                  deltaTone.className
                )}
              >
                {deltaTone.Icon ? <deltaTone.Icon className="h-3.5 w-3.5" /> : null}
                {deltaTone.label}
              </div>

              <p className="text-xs font-medium text-slate-500">
                {delta.previousValue == null
                  ? 'No hay una fecha previa cargada para calcular delta.'
                  : `Antes: ${formatValue(delta.previousValue, delta.format)} · Delta: ${formatValue(Math.abs(delta.delta ?? 0), delta.format)}`}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
