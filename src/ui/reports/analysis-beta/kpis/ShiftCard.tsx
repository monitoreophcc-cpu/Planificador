import type { ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { Sun, Moon, Clock, AlertTriangle } from 'lucide-react';

const KPIItem = ({
  title,
  value,
  colorClass,
  isAlert,
}: {
  title: string;
  value: string | number;
  colorClass?: string;
  isAlert?: boolean;
}) => (
  <div className={cn(
    'flex min-h-[72px] flex-col justify-center rounded-2xl border p-3 text-center shadow-sm transition-all',
    isAlert
      ? 'border-red-200 bg-red-50 text-red-700'
      : colorClass
        ? colorClass
        : 'border-slate-200 bg-slate-50'
  )}>
    <p className={cn('text-lg font-black tracking-tighter', isAlert ? 'text-red-700' : colorClass ? '' : 'text-slate-900')}>
      {value}
    </p>
    <p className={cn('mt-0.5 text-[8px] font-black uppercase tracking-widest', isAlert ? 'text-red-500' : colorClass ? '' : 'text-slate-400')}>
      {title}
    </p>
  </div>
);

type ShiftCardProps = {
  name: string;
  kpis: ShiftKPIs;
  showReadings?: boolean;
};

export default function ShiftCard({
  name,
  kpis,
  showReadings = false,
}: ShiftCardProps) {
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const isDay = name === 'Día';
  const isAlertSL = kpis.recibidas > 0 && kpis.atencion < 92;
  const isAlertAbandono = kpis.recibidas > 0 && kpis.abandonoPct >= 8;
  
  const getAtencionColor = (p: number) => {
    if (p >= 96) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (p >= 92) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-red-200 bg-red-50 text-red-700';
  };

  const getAbandonoColor = (p: number) => {
    if (p <= 4) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (p < 8) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-red-200 bg-red-50 text-red-700';
  };

  const headerBg = isAlertSL || isAlertAbandono ? 'bg-red-700' : (isDay ? 'bg-red-600' : 'bg-slate-900');
  const timeRange = isDay ? '09:00 - 15:30' : '16:00 - 23:30';
  const Icon = isDay ? Sun : Moon;
  const accentTone =
    isAlertSL || isAlertAbandono
      ? 'border-red-200 bg-red-50/70'
      : isDay
        ? 'border-red-100 bg-red-50/50'
        : 'border-slate-200 bg-slate-50/70';

  return (
    <div 
      className={cn(
        'overflow-hidden rounded-[1.75rem] border bg-white transition-all shadow-sm',
        isAlertSL || isAlertAbandono ? 'border-red-300 shadow-red-100' : 'border-slate-200'
      )}
    >
      <div className={cn('flex items-center justify-between p-5 text-white', headerBg)}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur-sm">
            {isAlertSL || isAlertAbandono ? <AlertTriangle size={20} /> : <Icon size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">
              Turno {name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-bold opacity-75">
              <Clock size={10} />
              {timeRange}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase opacity-75">Nivel de servicio</p>
          <p className="text-xl font-black leading-none">{formatPercent(kpis.atencion)}</p>
        </div>
      </div>
      <div className={cn('p-6', accentTone)}>
        {showReadings ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
              {kpis.recibidas.toLocaleString('en-US')} recibidas
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">
              {kpis.trans.toLocaleString('en-US')} transacciones
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 shadow-sm',
                isAlertAbandono ? 'bg-red-100 text-red-700' : 'bg-white'
              )}
            >
              {formatPercent(kpis.abandonoPct)} abandono
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <KPIItem title="Recibidas" value={kpis.recibidas.toLocaleString('en-US')} />
          <KPIItem title="Contestadas" value={kpis.contestadas.toLocaleString('en-US')} />
          <KPIItem title="Transacciones" value={kpis.trans.toLocaleString('en-US')} />
          <KPIItem title="% Conversión" value={formatPercent(kpis.conv)} />
          <KPIItem title="Abandonadas" value={kpis.abandonadas.toLocaleString('en-US')} />
          <KPIItem title="Duplicadas" value={kpis.duplicadas.toLocaleString('en-US')} />
          <KPIItem title="< 20s" value={kpis.lt20.toLocaleString('en-US')} />
          <KPIItem 
            title="% Atención" 
            value={formatPercent(kpis.atencion)} 
            isAlert={isAlertSL} 
            colorClass={!isAlertSL ? getAtencionColor(kpis.atencion) : ''}
          />
          <KPIItem 
            title="% Abandono" 
            value={formatPercent(kpis.abandonoPct)} 
            isAlert={isAlertAbandono}
            colorClass={!isAlertAbandono ? getAbandonoColor(kpis.abandonoPct) : ''}
          />
        </div>
      </div>
    </div>
  );
}
