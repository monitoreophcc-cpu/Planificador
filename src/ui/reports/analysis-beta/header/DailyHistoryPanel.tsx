'use client';

import { useMemo, useState } from 'react';
import { useAccess } from '@/hooks/useAccess';
import { History, CalendarDays, Check, ChevronDown, Trash2 } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/reports/analysis-beta/ui/popover';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { useToast } from '@/ui/reports/analysis-beta/hooks/use-toast';

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const coverageLabels = [
  { key: 'answeredLoaded', label: 'Contestadas' },
  { key: 'abandonedLoaded', label: 'Abandonadas' },
  { key: 'transactionsLoaded', label: 'Transacciones' },
] as const;

export default function DailyHistoryPanel() {
  const { canEditData } = useAccess();
  const [open, setOpen] = useState(false);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const setDataDate = useDashboardStore((state) => state.setDataDate);
  const clearAllData = useDashboardStore((state) => state.clearAllData);
  const removeHistoryDate = useDashboardStore((state) => state.removeHistoryDate);
  const { toast } = useToast();

  const snapshots = useMemo(
    () => Object.values(dailyHistory).sort((a, b) => b.date.localeCompare(a.date)),
    [dailyHistory]
  );

  const currentSnapshot = snapshots.find((snapshot) => snapshot.date === dataDate) ?? null;

  const handleRemoveDate = (date: string) => {
    if (!window.confirm(`¿Borrar explícitamente la fecha ${date} del historial?`)) {
      return;
    }

    removeHistoryDate(date);
    toast({
      title: 'Fecha eliminada',
      description: `${date} salió del historial cargado.`,
    });
  };

  const handleClearHistory = () => {
    if (!window.confirm('¿Borrar todo el historial cargado? Esta acción sí elimina los datos guardados.')) {
      return;
    }

    clearAllData();
    setOpen(false);
    toast({
      title: 'Historial eliminado',
      description: 'Todos los días cargados fueron eliminados explícitamente.',
    });
  };

  if (snapshots.length === 0) {
    return (
      <Button
        variant="outline"
        disabled
        className="h-9 rounded-xl border-slate-200 bg-slate-50 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400"
      >
        <History className="h-4 w-4" />
        Historial vacío
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 rounded-xl border-slate-200 bg-white px-3 text-left hover:bg-slate-50"
        >
          <History className="h-4 w-4 text-slate-500" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Historial
            </span>
            <span className="text-[11px] font-black text-slate-900">
              {currentSnapshot?.date || `${snapshots.length} dias`}
            </span>
          </span>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
            {snapshots.length}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[340px] rounded-2xl border-slate-200 bg-white p-0 shadow-xl"
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Historial cargado
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {snapshots.length} dias
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            El historial se conserva aunque limpies la vista. Aquí es donde se borra de forma explícita.
          </p>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {snapshots.map((snapshot) => {
            const isActive = snapshot.date === dataDate;

            return (
              <div
                key={snapshot.date}
                onClick={() => {
                  setDataDate(snapshot.date);
                  setOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setDataDate(snapshot.date);
                    setOpen(false);
                  }
                }}
                role="button"
                tabIndex={0}
                className={cn(
                  'w-full rounded-xl border px-3 py-3 text-left transition-colors',
                  isActive
                    ? 'border-red-200 bg-red-50/70'
                    : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="text-xs font-black tracking-wide">{snapshot.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                        <Check className="h-3 w-3" />
                        Actual
                      </span>
                    ) : null}
                    {canEditData ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title={`Borrar ${snapshot.date} del historial`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemoveDate(snapshot.date);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Borrar fecha</span>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <span>{snapshot.kpis.recibidas.toLocaleString('en-US')} rec.</span>
                  <span>{formatPercent(snapshot.kpis.nivelDeServicio)} atn.</span>
                  <span>{formatPercent(snapshot.kpis.conversion)} conv.</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {coverageLabels.map((coverage) => {
                    const loaded = snapshot.coverage[coverage.key];

                    return (
                      <span
                        key={`${snapshot.date}-${coverage.key}`}
                        className={cn(
                          'rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
                          loaded
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        )}
                      >
                        {coverage.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {canEditData ? (
          <div className="border-t border-slate-100 p-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-xl border-red-200 bg-red-50 text-[11px] font-black uppercase tracking-[0.14em] text-red-700 hover:bg-red-100"
              onClick={handleClearHistory}
            >
              <Trash2 className="h-4 w-4" />
              Borrar todo el historial
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
