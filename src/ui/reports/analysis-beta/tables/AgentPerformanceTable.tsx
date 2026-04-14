'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/ui/reports/analysis-beta/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/reports/analysis-beta/ui/card';
import { Input } from '@/ui/reports/analysis-beta/ui/input';
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  DollarSign,
  ShoppingCart,
  Link2,
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import { AgentKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  buildRepresentativeLinkMap,
  summarizeRepresentativeCoverage,
} from '@/ui/reports/analysis-beta/services/representative-link.service';
import { MANUAL_REPRESENTATIVE_LINKS } from '@/ui/reports/analysis-beta/config/manualRepresentativeLinks';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
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

type SortConfig = {
  key: keyof AgentKPIs;
  direction: 'asc' | 'desc';
} | null;

type AgentPerformanceTableProps = {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  filter?: 'all' | 'agents' | 'platforms';
  embedded?: boolean;
};

export default function AgentPerformanceTable({
  title = 'Representantes del día',
  subtitle = 'Transacciones y ventas válidas por representante',
  searchPlaceholder = 'Buscar representante...',
  filter = 'agents',
  embedded = false,
}: AgentPerformanceTableProps) {
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const manualRepresentativeLinks = useDashboardStore(
    (state) => state.manualRepresentativeLinks
  );
  const upsertManualRepresentativeLink = useDashboardStore(
    (state) => state.upsertManualRepresentativeLink
  );
  const representatives = useAppStore((state) => state.representatives);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkingAgentName, setLinkingAgentName] = useState<string | null>(null);
  const [selectedRepresentativeName, setSelectedRepresentativeName] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ventas', direction: 'desc' });
  const formatCount = (value: number) => value.toLocaleString('en-US');
  const formatCurrency = (value: number) =>
    `RD$ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const activeRepresentatives = useMemo(
    () =>
      representatives
        .filter((rep) => rep.isActive)
        .sort((left, right) => left.name.localeCompare(right.name, 'es')),
    [representatives]
  );

  const agentData = useMemo(() => {
    const filtered = dataDate
      ? transactions.filter((tx) => tx.fecha === dataDate)
      : [];
    const aggregated = aggregateByAgent(filtered);

    if (filter === 'agents') {
      return aggregated.filter((item) => item.tipo === 'agente');
    }

    if (filter === 'platforms') {
      return aggregated.filter((item) => item.tipo === 'plataforma');
    }

    return aggregated;
  }, [transactions, dataDate, filter]);

  const handleSort = (key: keyof AgentKPIs) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...agentData];

    if (searchTerm) {
      result = result.filter((agent) =>
        agent.agente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [agentData, searchTerm, sortConfig]);

  const representativeLinks = useMemo(
    () =>
      buildRepresentativeLinkMap(agentData, representatives, [
        ...MANUAL_REPRESENTATIVE_LINKS,
        ...manualRepresentativeLinks,
      ]),
    [agentData, representatives, manualRepresentativeLinks]
  );
  const coverageSummary = useMemo(
    () => summarizeRepresentativeCoverage(agentData, representativeLinks),
    [agentData, representativeLinks]
  );

  const SortIcon = ({ columnKey }: { columnKey: keyof AgentKPIs }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} className="ml-1 text-red-600" />
      : <ArrowDown size={12} className="ml-1 text-red-600" />;
  };

  if (agentData.length === 0) return null;

  const handleLinkRepresentative = () => {
    if (!linkingAgentName || !selectedRepresentativeName) {
      return;
    }

    upsertManualRepresentativeLink({
      agentName: linkingAgentName,
      representativeName: selectedRepresentativeName,
    });

    setLinkingAgentName(null);
    setSelectedRepresentativeName('');
  };

  const table = (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
              <Users size={14} className={filter === 'platforms' ? 'text-amber-600' : 'text-red-600'} />
              {title}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {subtitle}
              {filter === 'agents' && coverageSummary.totalAgents > 0 ? (
                <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                  {coverageSummary.linkedAgents}/{coverageSummary.totalAgents} vinculados
                </span>
              ) : null}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              className="rounded-xl border-slate-200 bg-white pl-9 text-xs font-bold focus-visible:ring-red-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="cursor-pointer py-4 transition-colors hover:text-red-600" onClick={() => handleSort('agente')}>
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                    {filter === 'platforms' ? 'Plataforma' : 'Representante'} <SortIcon columnKey="agente" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer py-4 text-center transition-colors hover:text-red-600" onClick={() => handleSort('transacciones')}>
                  <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                    <ShoppingCart size={12} className="mr-1" /> Transacciones <SortIcon columnKey="transacciones" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer py-4 text-center transition-colors hover:text-red-600" onClick={() => handleSort('ventas')}>
                  <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                    <DollarSign size={12} className="mr-1" /> Ventas <SortIcon columnKey="ventas" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer py-4 text-center transition-colors hover:text-red-600" onClick={() => handleSort('ticketPromedio')}>
                  <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                    <Receipt size={12} className="mr-1" /> Ticket Prom. <SortIcon columnKey="ticketPromedio" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((agent, idx) => (
                  <TableRow
                    key={`${agent.tipo}-${agent.codigo || agent.agente}`}
                    className={cn(
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30',
                      'transition-colors hover:bg-slate-100'
                    )}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black uppercase',
                            agent.tipo === 'plataforma'
                              ? 'bg-amber-100 text-amber-700'
                              : agent.tipo === 'sin_registro'
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-red-100 text-red-600'
                          )}
                        >
                          {agent.agente.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={cn(
                              'block truncate text-xs font-black',
                              agent.tipo === 'plataforma'
                                ? 'text-amber-800'
                                : agent.tipo === 'sin_registro'
                                  ? 'text-slate-500'
                                  : 'text-slate-900'
                            )}
                          >
                            {agent.agente}
                          </span>
                          {agent.tipo === 'agente' ? (
                            (() => {
                              const link = representativeLinks.get(agent.agente);
                              if (!link) {
                                return (
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">
                                      Sin vínculo
                                    </span>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 rounded-lg px-2 text-[9px] font-black uppercase tracking-[0.08em] text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                      onClick={() => setLinkingAgentName(agent.agente)}
                                    >
                                      <Link2 className="mr-1 h-3.5 w-3.5" />
                                      Vincular
                                    </Button>
                                  </div>
                                );
                              }

                              return (
                                <span
                                  className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700"
                                  title={
                                    link.matchType === 'manual_override'
                                      ? `Vinculado manualmente a ${link.representativeName}`
                                      : `Coincidencia automática con ${link.representativeName}`
                                  }
                                >
                                  {link.matchType === 'manual_override'
                                    ? 'Vinculado (manual)'
                                    : 'Vinculado'}
                                </span>
                              );
                            })()
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {formatCount(agent.transacciones)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {formatCurrency(agent.ventas)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">
                        {formatCurrency(agent.ticketPromedio)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users size={24} className="opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        No se encontraron registros
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const linkDialog = (
    <Dialog
      open={Boolean(linkingAgentName)}
      onOpenChange={(open) => {
        if (!open) {
          setLinkingAgentName(null);
          setSelectedRepresentativeName('');
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Vincular representante manualmente</DialogTitle>
          <DialogDescription>
            Asocia el agente <strong>{linkingAgentName ?? ''}</strong> con un representante activo
            del sistema. Este vínculo se aplica de inmediato en la vista actual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Representante del sistema
          </p>
          <Select
            value={selectedRepresentativeName}
            onValueChange={setSelectedRepresentativeName}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona representante..." />
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

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setLinkingAgentName(null);
              setSelectedRepresentativeName('');
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleLinkRepresentative}
            disabled={!selectedRepresentativeName}
          >
            Guardar vínculo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (embedded) {
    return (
      <>
        {table}
        {linkDialog}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-red-600" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Bloque comercial
        </h2>
      </div>
      {table}
      {linkDialog}
    </div>
  );
}
