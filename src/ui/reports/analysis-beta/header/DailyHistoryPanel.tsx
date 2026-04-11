'use client';

import { useMemo } from 'react';
import { History, CalendarDays, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Button } from '@/ui/reports/analysis-beta/ui/button';

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function DailyHistoryPanel() {
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const setDataDate = useDashboardStore((state) => state.setDataDate);

  const snapshots = useMemo(
    () => Object.values(dailyHistory).sort((a, b) => b.date.localeCompare(a.date)),
    [dailyHistory]
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Historial diario</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {snapshots.length} días guardados
        </span>
      </div>

      {snapshots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Aún no hay resultados guardados. Carga archivos para comenzar el historial.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-h-[320px] overflow-auto pr-1">
          {snapshots.map((snapshot) => {
            const isActive = snapshot.date === dataDate;

            return (
              <article
                key={snapshot.date}
                className={`rounded-xl border p-3 transition-colors ${
                  isActive
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-xs font-black tracking-wide">{snapshot.date}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className="h-7 text-[10px]"
                    onClick={() => setDataDate(snapshot.date)}
                  >
                    {isActive ? 'Viendo' : 'Ver día'} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <p className="text-slate-500 font-semibold">Recibidas</p>
                    <p className="font-black text-slate-900">{snapshot.kpis.recibidas}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-2">
                    <p className="text-slate-500 font-semibold">Atención</p>
                    <p className="font-black text-slate-900">{formatPercent(snapshot.kpis.nivelDeServicio)}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-2">
                    <p className="text-slate-500 font-semibold">Conversión</p>
                    <p className="font-black text-slate-900">{formatPercent(snapshot.kpis.conversion)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
