'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeSlotKpi } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';
import { Table as TableIcon } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard.store';

type ShiftDetailTableProps = {
  title: string;
  data: TimeSlotKpi[];
};

const heatClassAtencion = (p: number) => {
  if (p >= 96) return 'text-emerald-600 font-black';
  if (p >= 92) return 'text-amber-500 font-black';
  return 'text-red-600 font-black';
};

const heatClassAbandono = (p: number) => {
  if (p <= 4) return 'text-emerald-600 font-black';
  if (p < 8) return 'text-amber-500 font-black';
  return 'text-red-600 font-black';
};

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

export default function ShiftDetailTable({ title, data }: ShiftDetailTableProps) {
  const selectedHour = useDashboardStore((state) => state.selectedHour);
  const setSelectedHour = useDashboardStore((state) => state.setSelectedHour);
  
  if (!data) {
    return null;
  }

  const isDay = title.includes('Día');
  const headerBg = isDay ? 'bg-red-600' : 'bg-slate-900';

  return (
    <Card className={cn(
      "rounded-2xl shadow-sm overflow-hidden border transition-all",
      selectedHour ? "border-red-200" : "border-slate-200"
    )}>
        <CardHeader className={cn(headerBg, 'p-4 flex flex-row justify-between items-center')}>
          <CardTitle className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <TableIcon size={14} />
            {title}
          </CardTitle>
          {selectedHour && (
            <button 
              onClick={() => setSelectedHour(null)}
              className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-md font-bold uppercase tracking-tighter transition-colors"
            >
              Limpiar Filtro
            </button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-20 shadow-sm">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Hora</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Recib.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Cont.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">AVG Time</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">% Atenc.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Aband.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">AVG Aband.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">% Aband.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s, idx) => {
                  const isSelected = s.hora === selectedHour;
                  return (
                    <TableRow 
                      key={s.hora} 
                      className={cn(
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30', 
                        'hover:bg-slate-100 transition-colors cursor-pointer',
                        isSelected && "bg-red-50 hover:bg-red-100 ring-1 ring-inset ring-red-200"
                      )}
                      onClick={() => setSelectedHour(isSelected ? null : s.hora)}
                    >
                      <TableCell className={cn("text-xs font-black py-2", isSelected ? "text-red-600" : "text-slate-900")}>
                        {s.hora}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 py-2">{s.recibidas}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 py-2">{s.contestadas}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 py-2">{s.conexionAvg.toFixed(1)}s</TableCell>
                      <TableCell className={cn('text-xs py-2', heatClassAtencion(s.pctAtencion))}>
                        {formatPercent(s.pctAtencion)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 py-2">{s.abandonadas}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 py-2">{s.abandAvg.toFixed(1)}s</TableCell>
                      <TableCell className={cn('text-xs py-2', heatClassAbandono(s.pctAband))}>
                        {formatPercent(s.pctAband)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
  );
}
