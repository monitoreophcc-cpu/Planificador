'use client';

import { useMemo, useState } from 'react';
import { BarChart3, BriefcaseBusiness, Link2, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import { MANUAL_REPRESENTATIVE_LINKS } from '@/ui/reports/analysis-beta/config/manualRepresentativeLinks';
import { buildRepresentativeLinkMap } from '@/ui/reports/analysis-beta/services/representative-link.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/reports/analysis-beta/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/reports/analysis-beta/ui/select';
import AgentPerformanceTable from './AgentPerformanceTable';
import MonthlyRepresentativeTable from './MonthlyRepresentativeTable';

const tabs = [
  {
    value: 'day',
    label: 'Día actual',
    Icon: BriefcaseBusiness,
  },
  {
    value: 'month',
    label: 'Acumulado del mes',
    Icon: BarChart3,
  },
] as const;

export default function CommercialPerformancePanel() {
  const commercialView = useDashboardStore((state) => state.commercialView);
  const setCommercialView = useDashboardStore((state) => state.setCommercialView);
  const manualRepresentativeLinks = useDashboardStore(
    (state) => state.manualRepresentativeLinks
  );
  const upsertManualRepresentativeLink = useDashboardStore(
    (state) => state.upsertManualRepresentativeLink
  );
  const removeManualRepresentativeLink = useDashboardStore(
    (state) => state.removeManualRepresentativeLink
  );
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const representatives = useAppStore((state) => state.representatives);
  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState('');
  const [selectedRepresentativeName, setSelectedRepresentativeName] = useState('');

  const activeRepresentatives = useMemo(
    () =>
      representatives
        .filter((rep) => rep.isActive)
        .sort((left, right) => left.name.localeCompare(right.name, 'es')),
    [representatives]
  );

  const dayAgentRows = useMemo(() => {
    if (!dataDate) return [];
    return aggregateByAgent(transactions.filter((tx) => tx.fecha === dataDate)).filter(
      (row) => row.tipo === 'agente'
    );
  }, [transactions, dataDate]);

  const resolvedLinks = useMemo(
    () =>
      buildRepresentativeLinkMap(dayAgentRows, representatives, [
        ...MANUAL_REPRESENTATIVE_LINKS,
        ...manualRepresentativeLinks,
      ]),
    [dayAgentRows, representatives, manualRepresentativeLinks]
  );

  const unresolvedAgentNames = useMemo(
    () =>
      dayAgentRows
        .filter((row) => !resolvedLinks.has(row.agente))
        .map((row) => row.agente)
        .sort((left, right) => left.localeCompare(right, 'es')),
    [dayAgentRows, resolvedLinks]
  );

  const handleSaveLink = () => {
    if (!selectedAgentName || !selectedRepresentativeName) return;
    upsertManualRepresentativeLink({
      agentName: selectedAgentName,
      representativeName: selectedRepresentativeName,
    });
    setSelectedAgentName('');
    setSelectedRepresentativeName('');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-red-600" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Seguimiento por representante
        </h2>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-900">Desempeño por representante</h3>
              <button
                type="button"
                onClick={() => setIsLinkManagerOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
                title="Gestionar enlaces representante ↔ reporte"
                aria-label="Gestionar enlaces representante ↔ reporte"
              >
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Revisa transacciones por representante en el día activo o en el acumulado del mes.
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
        </div>
      </div>

      <Dialog open={isLinkManagerOpen} onOpenChange={setIsLinkManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enlaces de representantes</DialogTitle>
            <DialogDescription>
              Gestiona los enlaces manuales para resolver nombres del reporte que no se
              vinculan automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select value={selectedAgentName} onValueChange={setSelectedAgentName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona agente del reporte" />
              </SelectTrigger>
              <SelectContent>
                {unresolvedAgentNames.map((agentName) => (
                  <SelectItem key={agentName} value={agentName}>
                    {agentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRepresentativeName} onValueChange={setSelectedRepresentativeName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona representante del sistema" />
              </SelectTrigger>
              <SelectContent>
                {activeRepresentatives.map((representative) => (
                  <SelectItem key={representative.id} value={representative.name}>
                    {representative.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-56 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.1em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Agente reporte</th>
                  <th className="px-3 py-2">Representante</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {manualRepresentativeLinks.map((link) => (
                  <tr key={link.agentName} className="border-t border-slate-100">
                    <td className="px-3 py-2">{link.agentName}</td>
                    <td className="px-3 py-2">{link.representativeName}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeManualRepresentativeLink(link.agentName)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
                        title="Eliminar enlace manual"
                        aria-label="Eliminar enlace manual"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {manualRepresentativeLinks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-500">
                      No hay enlaces manuales guardados en esta sesión.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleSaveLink}
              disabled={!selectedAgentName || !selectedRepresentativeName}
            >
              Guardar enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
