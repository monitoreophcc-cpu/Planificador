'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';
import KPISummary from '@/ui/reports/analysis-beta/kpis/KPISummary';
import FileLoadButtons from '@/ui/reports/analysis-beta/header/FileLoadButtons';
import ShiftGrid from '@/ui/reports/analysis-beta/shifts/ShiftGrid';
import KPIObserver from '@/ui/reports/analysis-beta/kpis/KPIObserver';
import { Target, Download, FileText } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/reports/analysis-beta/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/reports/analysis-beta/ui/popover';
import ShiftTablesContainer from '@/ui/reports/analysis-beta/tables/ShiftTablesContainer';
import AgentPerformanceTable from '@/ui/reports/analysis-beta/tables/AgentPerformanceTable';
import DateRangeBadge from '@/ui/reports/analysis-beta/header/DateRangeBadge';
import DateSelector from '@/ui/reports/analysis-beta/header/DateSelector';
import DailyHistoryPanel from '@/ui/reports/analysis-beta/header/DailyHistoryPanel';
import ComparisonPanel from '@/ui/reports/analysis-beta/header/ComparisonPanel';
import { Toaster } from '@/ui/reports/analysis-beta/ui/toaster';

const PDFExportButton = dynamic(() => import('@/ui/reports/analysis-beta/reports/PDFExportButton'), { 
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-slate-50 animate-pulse rounded-xl" />
});

const PerformanceChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/ShiftPerformanceChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const HourlyDistributionChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/HourlyDistributionChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const PlatformTransactionsChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/PlatformTransactionsChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const PlatformSalesChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/PlatformSalesChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const PlatformAovChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/PlatformAovChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const TopBranchesChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/TopBranchesChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const HourlyAbandonmentRateChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/HourlyAbandonmentRateChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const HourlyConversionRateChart = dynamic(() => import('@/ui/reports/analysis-beta/charts/HourlyConversionRateChart'), { 
  ssr: false,
  loading: () => <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />
});
const AuditView = dynamic(() => import('@/ui/reports/analysis-beta/audit/AuditView'), { 
  ssr: false,
  loading: () => <div className="h-96 w-full bg-slate-50 animate-pulse rounded-2xl" />
});

export function CallCenterAnalysisView() {
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const _hasHydrated = useDashboardStore((s) => s._hasHydrated);
  const kpis = useDashboardStore((s) => s.kpis);
  const kpisByShift = useDashboardStore((s) => s.kpisByShift);
  const dataDate = useDashboardStore((s) => s.dataDate);

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-12 font-sans">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 overflow-hidden">
                <Image 
                  src="/icons/logo.svg"
                  alt="Pizza Hut Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Monitoreo Call Center
              </h1>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
              <span>Sistema de análisis de llamadas y transacciones</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>v1.0.4</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Actualizado {lastUpdated}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <DateRangeBadge />
            </div>
            <DateSelector />
            
            <PDFExportButton kpis={kpis} kpisByShift={kpisByShift} date={dataDate} />

            <FileLoadButtons />
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-8 mt-8 space-y-10">
        <Tabs defaultValue="main" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList>
              <TabsTrigger value="main">
                Vista Principal
              </TabsTrigger>
              <TabsTrigger value="analysis">
                Análisis Gráfico
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="main" className="space-y-10 focus-visible:outline-none">
            <DailyHistoryPanel />
            <ComparisonPanel />
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 bg-red-600 rounded-full" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Resumen de KPIs</h2>
              </div>
              <KPISummary />
            </section>

            <section className="space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-1 bg-red-600 rounded-full" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Distribución por Turnos</h2>
                </div>
                <ShiftGrid />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-1 bg-red-600 rounded-full" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Detalle de Operaciones</h2>
                </div>
                <ShiftTablesContainer />
              </div>

              <AgentPerformanceTable />
              
              <AuditView />
            </section>
          </TabsContent>

          <TabsContent value="analysis" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceChart />
              <HourlyDistributionChart />
              <HourlyAbandonmentRateChart />
              <HourlyConversionRateChart />
              <PlatformTransactionsChart />
              <PlatformSalesChart />
              <PlatformAovChart />
              <TopBranchesChart />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <KPIObserver />
      <Toaster />
    </main>
  );
}
