import type { ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { Sun, Moon, Clock, AlertTriangle } from 'lucide-react';

const KPIItem = ({ title, value, colorClass, isAlert }: { title: string; value: string | number; colorClass?: string; isAlert?: boolean }) => (
  <div className={cn(
    "rounded-xl p-3 text-center border shadow-sm flex flex-col justify-center min-h-[70px] transition-all hover:scale-105", 
    isAlert ? "bg-red-600 border-red-700 text-white animate-pulse" : (colorClass ? colorClass : "bg-slate-50 border-slate-100")
  )}>
    <p className={cn("text-lg font-black tracking-tighter", isAlert ? "text-white" : (colorClass ? "" : "text-slate-900"))}>{value}</p>
    <p className={cn("text-[8px] uppercase font-black mt-0.5 tracking-widest", isAlert ? "text-red-100" : (colorClass ? "" : "text-slate-400"))}>{title}</p>
  </div>
);

type ShiftCardProps = {
  name: string;
  kpis: ShiftKPIs;
};

export default function ShiftCard({ name, kpis }: ShiftCardProps) {
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const isDay = name === 'Día';
  const isAlertSL = kpis.recibidas > 0 && kpis.atencion < 92;
  const isAlertAbandono = kpis.recibidas > 0 && kpis.abandonoPct >= 8;
  
  const getAtencionColor = (p: number) => {
    if (p >= 96) return 'text-emerald-600';
    if (p >= 92) return 'text-amber-500';
    return 'text-red-600';
  };

  const getAbandonoColor = (p: number) => {
    if (p <= 4) return 'text-emerald-600';
    if (p < 8) return 'text-amber-500';
    return 'text-red-600';
  };

  const headerBg = isAlertSL || isAlertAbandono ? 'bg-red-700' : (isDay ? 'bg-red-600' : 'bg-slate-900');
  const timeRange = isDay ? '09:00 - 15:30' : '16:00 - 23:30';
  const Icon = isDay ? Sun : Moon;

  return (
    <div 
      className={cn(
        "rounded-2xl bg-white overflow-hidden border transition-all",
        isAlertSL || isAlertAbandono ? "border-red-500 ring-2 ring-red-500" : "border-slate-200"
      )}
    >
      <div className={`${headerBg} p-4 text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {isAlertSL || isAlertAbandono ? <AlertTriangle size={20} className="animate-bounce" /> : <Icon size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">
              Turno {name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-bold opacity-70">
              <Clock size={10} />
              {timeRange}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase opacity-70">Nivel de Servicio</p>
          <p className={cn("text-xl font-black leading-none", isAlertSL && "text-white animate-pulse")}>{formatPercent(kpis.atencion)}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <KPIItem title="Recibidas" value={kpis.recibidas} />
          <KPIItem title="Contestadas" value={kpis.contestadas} />
          <KPIItem title="Transacciones" value={kpis.trans} />
          <KPIItem title="% Conversión" value={formatPercent(kpis.conv)} />
          <KPIItem title="Abandonadas" value={kpis.abandonadas} />
          <KPIItem title="Duplicadas" value={kpis.duplicadas} />
          <KPIItem title="< 20s" value={kpis.lt20} />
          <KPIItem 
            title="% Atención" 
            value={formatPercent(kpis.atencion)} 
            isAlert={isAlertSL} 
            colorClass={!isAlertSL ? getAtencionColor(kpis.atencion) : ""}
          />
          <KPIItem 
            title="% Abandono" 
            value={formatPercent(kpis.abandonoPct)} 
            isAlert={isAlertAbandono}
            colorClass={!isAlertAbandono ? getAbandonoColor(kpis.abandonoPct) : ""}
          />
        </div>
      </div>
    </div>
  );
}
