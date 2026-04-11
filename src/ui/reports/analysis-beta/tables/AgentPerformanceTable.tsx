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
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import { AgentKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';

type SortConfig = {
  key: keyof AgentKPIs;
  direction: 'asc' | 'desc';
} | null;

export default function AgentPerformanceTable() {
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ventas', direction: 'desc' });

  const agentData = useMemo(() => {
    const filtered = dataDate
      ? transactions.filter((tx) => tx.fecha === dataDate)
      : transactions;
    return aggregateByAgent(filtered);
  }, [transactions, dataDate]);

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

  const SortIcon = ({ columnKey }: { columnKey: keyof AgentKPIs }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} className="ml-1 text-red-600" />
      : <ArrowDown size={12} className="ml-1 text-red-600" />;
  };

  if (agentData.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-red-600 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Rendimiento por Agente</h2>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar agente..."
            className="pl-9 bg-white border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-red-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
          <CardTitle className="text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-red-600" />
            Transacciones y Ventas por Agente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-slate-200">
                  <TableHead className="cursor-pointer hover:text-red-600 transition-colors py-4" onClick={() => handleSort('agente')}>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                      Agente <SortIcon columnKey="agente" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-red-600 transition-colors py-4 text-center" onClick={() => handleSort('transacciones')}>
                    <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                      <ShoppingCart size={12} className="mr-1" /> Transacciones <SortIcon columnKey="transacciones" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-red-600 transition-colors py-4 text-center" onClick={() => handleSort('ventas')}>
                    <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                      <DollarSign size={12} className="mr-1" /> Ventas <SortIcon columnKey="ventas" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-red-600 transition-colors py-4 text-center" onClick={() => handleSort('ticketPromedio')}>
                    <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
                      <Receipt size={12} className="mr-1" /> Ticket Prom. <SortIcon columnKey="ticketPromedio" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length > 0 ? (
                  filteredAndSortedData.map((agent, idx) => (
                    <TableRow key={agent.agente} className={cn(idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30', 'hover:bg-slate-100 transition-colors')}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-black uppercase">
                            {agent.agente.substring(0, 2)}
                          </div>
                          <span className="text-xs font-black text-slate-900">{agent.agente}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-xs font-bold text-slate-600">{agent.transacciones}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-xs font-bold text-slate-600">RD$ {agent.ventas.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-xs font-bold text-slate-600">RD$ {agent.ticketPromedio.toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Users size={24} className="opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No se encontraron agentes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
