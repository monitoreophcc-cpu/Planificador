'use client';

import { useMemo } from 'react';
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
  buildKpiDeltasFromKpis,
  getPreviousSnapshot,
} from '@/ui/reports/analysis-beta/services/executive.service';
import type { KPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

const KPI_ICONS: Record<string, LucideIcon> = {
  'Llamadas Recibidas': PhoneIncoming,
  'Llamadas Contestadas': PhoneCall,
  'Llamadas Abandonadas': PhoneOff,
  '% Atención': Target,
  '% Abandono': Percent,
  'Transacciones': ShoppingCart,
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
        label: 'Mejor que antes',
        className: 'bg-emerald-50 text-emerald-700',
        Icon: ArrowUpRight,
      }
    : {
        label: 'Por debajo de antes',
        className: 'bg-red-50 text-red-700',
        Icon: ArrowDownRight,
      };
}

type KPISummaryProps = {
  currentKpis?: KPIs | null;
  previousKpis?: KPIs | null;
  showReadings?: boolean;
};

export default function KPISummary({
  currentKpis,
  previousKpis,
  showReadings = false,
}: KPISummaryProps) {
  const selectedDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const currentSnapshot =
    currentKpis === undefined ? (selectedDate ? dailyHistory[selectedDate] ?? null : null) : null;
  const previousSnapshot =
    currentKpis === undefined ? getPreviousSnapshot(dailyHistory, selectedDate) : null;
  const deltas = useMemo(
    () =>
      currentKpis !== undefined
        ? buildKpiDeltasFromKpis({
            current: currentKpis,
            previous: previousKpis ?? null,
          })
        : buildKpiDeltas({
            current: currentSnapshot,
            previous: previousSnapshot,
          }),
    [currentKpis, currentSnapshot, previousKpis, previousSnapshot]
  );

  if (deltas.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {deltas.map((delta) => {
        const Icon = KPI_ICONS[delta.label] ?? Percent;
        const deltaTone = getDeltaTone(delta.label, delta.delta);

        return (
          <article
            key={delta.label}
            className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 space-y-2 pr-1">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500 xl:text-[12px]">
                  {delta.label}
                </p>
                <p
                  className={cn(
                    'text-[2.3rem] font-black leading-none xl:text-[2.5rem]',
                    getValueTone(delta.label, delta.currentValue)
                  )}
                >
                  {formatValue(delta.currentValue, delta.format)}
                </p>
              </div>
              <div className="ml-auto mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
            </div>

            {showReadings ? (
              <div className="mt-4 space-y-2">
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
                    ? 'No hay una fecha anterior cargada para comparar.'
                    : `Antes: ${formatValue(delta.previousValue, delta.format)} · Dif: ${formatValue(Math.abs(delta.delta ?? 0), delta.format)}`}
                </p>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
