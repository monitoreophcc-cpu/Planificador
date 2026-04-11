'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function DateRangeBadge() {
  const dataDate = useDashboardStore((state) => state.dataDate);
  const allAns = useDashboardStore((state) => state.answeredCalls);
  const allAbn = useDashboardStore((state) => state.abandonedCalls);

  if (!dataDate) {
    return (
      <div className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-inner opacity-60">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-black text-slate-400 leading-tight tracking-[0.1em]">Período de Análisis</span>
          <span className="text-[11px] font-mono tracking-wider font-bold">-- / -- / ----</span>
        </div>
        <Calendar className="h-4 w-4 text-slate-300" />
      </div>
    );
  }

  const answeredCalls = allAns.filter(c => c.fecha === dataDate);
  const abandonedCalls = allAbn.filter(c => c.fecha === dataDate);

  const allTimes = [
    ...answeredCalls.map((c) => c.hora),
    ...abandonedCalls.map((c) => c.hora),
  ].filter(Boolean);

  let timeRange = '';
  if (allTimes.length > 0) {
    const sortedTimes = allTimes.sort();
    const minTime = sortedTimes[0].substring(0, 5);
    const maxTime = sortedTimes[sortedTimes.length - 1].substring(0, 5);
    timeRange = ` (${minTime} - ${maxTime})`;
  }

  return (
    <div className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-inner transition-all hover:bg-slate-100">
      <div className="flex flex-col">
        <span className="text-[9px] uppercase font-black text-slate-500 leading-tight tracking-[0.1em]">Período de Análisis</span>
        <span className="text-[11px] font-mono tracking-wider font-bold">
          {dataDate.split('-').reverse().join(' / ')}
          <span className="text-slate-400 ml-1 font-normal">{timeRange}</span>
        </span>
      </div>
      <Calendar className="h-4 w-4 text-slate-400" />
    </div>
  );
}
