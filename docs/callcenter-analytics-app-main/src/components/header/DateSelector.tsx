'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export default function DateSelector() {
  const availableDates = useDashboardStore((state) => state.availableDates);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const setDataDate = useDashboardStore((state) => state.setDataDate);

  const isDisabled = availableDates.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-slate-400" />
      <Select value={dataDate || ''} onValueChange={setDataDate} disabled={isDisabled}>
        <SelectTrigger className="w-[160px] h-9 bg-slate-50 border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all disabled:opacity-40">
          <SelectValue placeholder={isDisabled ? "SIN DATOS" : "FECHA"} />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-xl">
          {availableDates.map((date) => (
            <SelectItem key={date} value={date} className="text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
              {date}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
