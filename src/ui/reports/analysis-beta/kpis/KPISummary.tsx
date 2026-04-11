'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { 
  PhoneCall, 
  PhoneOff, 
  PhoneIncoming, 
  Percent, 
  TrendingUp, 
  CreditCard, 
  Target,
  AlertTriangle
} from 'lucide-react';

type KPICardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delay?: number;
  isAlert?: boolean;
  valueColorClass?: string;
};

function KPICard({ label, value, icon, delay = 0, isAlert = false, valueColorClass }: KPICardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-sm border p-5 flex flex-col items-center justify-between gap-3 relative overflow-hidden group hover:shadow-md transition-all",
        isAlert ? "border-red-500 shadow-red-100 ring-1 ring-red-500" : "border-gray-100"
      )}
    >
      {/* Top color bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl",
        isAlert ? "bg-red-600" : "bg-gradient-to-r from-red-600 via-red-500 to-red-400"
      )} />

      <div className={cn(
        "p-2 rounded-lg group-hover:scale-110 transition-transform",
        isAlert ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600"
      )}>
        {isAlert ? <AlertTriangle size={18} /> : icon}
      </div>

      <p className={cn(
        "text-[10px] font-bold tracking-widest uppercase text-center",
        isAlert ? "text-red-600" : "text-gray-400"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-3xl font-black leading-none",
        valueColorClass ? valueColorClass : (isAlert ? "text-red-700" : "text-slate-900")
      )}>
        {value}
      </p>
    </div>
  );
}

export default function KPISummary() {
  const kpis = useDashboardStore((s) => s.kpis);

  const fmt = (n: number) => n.toLocaleString('es-DO');
  const pct = (n: number) => `${n.toFixed(1)}%`;

  const abandonmentRate = kpis.recibidas > 0 ? (kpis.abandonadas / kpis.recibidas) * 100 : 0;

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

  const cards = [
    { label: 'Total Recibidas',     value: fmt(kpis.recibidas), icon: <PhoneIncoming size={18} /> },
    { label: 'Total Contestadas',   value: fmt(kpis.contestadas), icon: <PhoneCall size={18} /> },
    { label: 'Total Abandonadas',   value: fmt(kpis.abandonadas), icon: <PhoneOff size={18} /> },
    { 
      label: '% Atención',          
      value: pct(kpis.nivelDeServicio), 
      icon: <Target size={18} />,
      isAlert: kpis.recibidas > 0 && kpis.nivelDeServicio < 92,
      valueColorClass: getAtencionColor(kpis.nivelDeServicio)
    },
    { 
      label: '% Abandono',          
      value: pct(abandonmentRate), 
      icon: <Percent size={18} />,
      isAlert: kpis.recibidas > 0 && abandonmentRate >= 8,
      valueColorClass: getAbandonoColor(abandonmentRate)
    },
    { label: 'Transacciones CC',    value: fmt(kpis.transaccionesCC), icon: <CreditCard size={18} /> },
    { label: '% Conversión',        value: pct(kpis.conversion), icon: <TrendingUp size={18} /> },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {cards.map((card, idx) => (
        <KPICard key={card.label} {...card} delay={idx * 0.05} />
      ))}
    </section>
  );
}
