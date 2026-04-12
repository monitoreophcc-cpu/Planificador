'use client';

import { BarChart3, BriefcaseBusiness, Globe2 } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import AgentPerformanceTable from './AgentPerformanceTable';
import MonthlyRepresentativeTable from './MonthlyRepresentativeTable';

const tabs = [
  {
    value: 'day',
    label: 'Representantes del día',
    Icon: BriefcaseBusiness,
  },
  {
    value: 'month',
    label: 'Representantes del mes',
    Icon: BarChart3,
  },
  {
    value: 'platforms',
    label: 'Plataformas digitales',
    Icon: Globe2,
  },
] as const;

export default function CommercialPerformancePanel() {
  const commercialView = useDashboardStore((state) => state.commercialView);
  const setCommercialView = useDashboardStore((state) => state.setCommercialView);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-red-600" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Rendimiento comercial
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">
              Representantes y plataformas
            </h3>
            <p className="text-sm text-slate-500">
              El bloque diario excluye plataformas por defecto y el acumulado mensual se actualiza solo con las fechas ya cargadas del mes activo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                  commercialView === tab.value
                    ? 'bg-white text-red-600 shadow-sm hover:bg-white'
                    : 'hover:bg-slate-200'
                )}
                onClick={() => setCommercialView(tab.value)}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {commercialView === 'day' ? (
            <AgentPerformanceTable
              embedded
              filter="agents"
              title="Representantes del día"
              subtitle="Solo representantes humanos del día seleccionado."
              searchPlaceholder="Buscar representante..."
            />
          ) : null}

          {commercialView === 'month' ? <MonthlyRepresentativeTable embedded /> : null}

          {commercialView === 'platforms' ? (
            <AgentPerformanceTable
              embedded
              filter="platforms"
              title="Plataformas digitales"
              subtitle="WA, WEB, AG y APP se leen por separado para no mezclarlas con desempeño humano."
              searchPlaceholder="Buscar plataforma..."
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
