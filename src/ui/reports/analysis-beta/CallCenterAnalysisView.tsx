'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { CalendarRange, Eye, EyeOff, History } from 'lucide-react';
import KPISummary from '@/ui/reports/analysis-beta/kpis/KPISummary';
import ShiftGrid from '@/ui/reports/analysis-beta/shifts/ShiftGrid';
import KPIObserver from '@/ui/reports/analysis-beta/kpis/KPIObserver';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/reports/analysis-beta/ui/tabs';
import ShiftTablesContainer from '@/ui/reports/analysis-beta/tables/ShiftTablesContainer';
import CommercialPerformancePanel from '@/ui/reports/analysis-beta/tables/CommercialPerformancePanel';
import DateRangeBadge from '@/ui/reports/analysis-beta/header/DateRangeBadge';
import DailyHistoryPanel from '@/ui/reports/analysis-beta/header/DailyHistoryPanel';
import ComparisonPanel from '@/ui/reports/analysis-beta/header/ComparisonPanel';
import CallCenterBrand from '@/ui/reports/analysis-beta/header/CallCenterBrand';
import ExportModal from '@/ui/reports/analysis-beta/header/ExportModal';
import DataManagementPanel from '@/ui/reports/analysis-beta/header/DataManagementPanel';
import MonthlyOperationalReport from '@/ui/reports/analysis-beta/operation/MonthlyOperationalReport';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import { Toaster } from '@/ui/reports/analysis-beta/ui/toaster';

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

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}

function buildAnalyzedPeriodLabel(dates: string[]) {
  const orderedDates = [...dates].sort();

  if (orderedDates.length <= 1) {
    const onlyDate = orderedDates[0];
    return onlyDate
      ? `Datos correspondientes a la fecha ${formatDisplayDate(onlyDate)}.`
      : 'Sin fechas cargadas todavía.';
  }

  return `Datos correspondientes al período ${formatDisplayDate(orderedDates[0])} al ${formatDisplayDate(orderedDates[orderedDates.length - 1])}.`;
}

export function CallCenterAnalysisView() {
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showGlobalReadings, setShowGlobalReadings] = useState(false);
  const [showShiftReadings, setShowShiftReadings] = useState(false);
  const _hasHydrated = useDashboardStore((s) => s._hasHydrated);
  const dataDate = useDashboardStore((s) => s.dataDate);
  const availableDates = useDashboardStore((s) => s.availableDates);
  const dailyHistory = useDashboardStore((s) => s.dailyHistory);
  const activeWorkspaceView = useDashboardStore((s) => s.activeWorkspaceView);
  const setActiveWorkspaceView = useDashboardStore((s) => s.setActiveWorkspaceView);

  const currentSnapshot = dataDate ? dailyHistory[dataDate] ?? null : null;
  const analyzedPeriodLabel = useMemo(
    () => buildAnalyzedPeriodLabel(availableDates),
    [availableDates]
  );
  const bestShiftInsight = useMemo(() => {
    if (!currentSnapshot) {
      return null;
    }

    const dayShift = currentSnapshot.shiftKpis.Día;
    const nightShift = currentSnapshot.shiftKpis.Noche;
    const bestShift =
      dayShift.atencion === nightShift.atencion
        ? dayShift.abandonoPct <= nightShift.abandonoPct
          ? 'Día'
          : 'Noche'
        : dayShift.atencion > nightShift.atencion
          ? 'Día'
          : 'Noche';
    const bestKpis = currentSnapshot.shiftKpis[bestShift];

    return {
      title: `Turno ${bestShift} sostuvo mejor el servicio`,
      detail: `Atención ${bestKpis.atencion.toFixed(1)}% · Abandono ${bestKpis.abandonoPct.toFixed(1)}% · ${bestKpis.trans.toLocaleString('en-US')} transacciones CC.`,
    };
  }, [currentSnapshot]);

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
            <CallCenterBrand />
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

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <DailyHistoryPanel />
            <ComparisonPanel />
            <ExportModal />
            <DataManagementPanel />
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-8 mt-8 space-y-10">
        {!dataDate ? (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 shadow-sm">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <CalendarRange className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Vista limpia
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                La vista principal está vacía, pero el historial sigue guardado.
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Usa el botón de historial para volver a una fecha ya cargada o sube nuevos archivos para trabajar otra jornada sin perder los datos anteriores.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <History className="h-4 w-4 text-slate-400" />
                  {availableDates.length} fechas guardadas
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <CalendarRange className="h-4 w-4 text-slate-400" />
                  Selecciona una fecha para continuar
                </span>
              </div>
            </div>
          </section>
        ) : (
          <Tabs
            value={activeWorkspaceView}
            onValueChange={(value) =>
              setActiveWorkspaceView(value as 'executive' | 'operation' | 'analysis')
            }
            className="w-full"
          >
            <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <DateRangeBadge />
              <TabsList>
                <TabsTrigger value="executive">Resumen ejecutivo</TabsTrigger>
                <TabsTrigger value="operation">Operación</TabsTrigger>
                <TabsTrigger value="analysis">Gráficas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="executive" className="space-y-10 focus-visible:outline-none">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Período analizado
                    </p>
                    <h2 className="text-lg font-black text-slate-900">
                      {availableDates.length > 1 ? 'Rango cargado en historial' : 'Fecha analizada'}
                    </h2>
                    <p className="text-sm text-slate-500">{analyzedPeriodLabel}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {availableDates.length.toLocaleString('en-US')} fecha{availableDates.length === 1 ? '' : 's'}
                  </span>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-red-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Rendimiento global
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowGlobalReadings((current) => !current)}
                  >
                    {showGlobalReadings ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showGlobalReadings ? 'Ocultar lecturas' : 'Mostrar lecturas'}
                  </Button>
                </div>
                <KPISummary showReadings={showGlobalReadings} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-red-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Rendimiento por turno
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowShiftReadings((current) => !current)}
                  >
                    {showShiftReadings ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showShiftReadings ? 'Ocultar lecturas' : 'Mostrar lecturas'}
                  </Button>
                </div>
                <ShiftGrid showReadings={showShiftReadings} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-red-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Visuales prioritarias
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <PerformanceChart />
                  <HourlyDistributionChart />
                  <HourlyConversionRateChart />
                  <PlatformSalesChart />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="operation" className="space-y-10 focus-visible:outline-none">
              {bestShiftInsight ? (
                <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Insight operativo
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">
                    {bestShiftInsight.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{bestShiftInsight.detail}</p>
                </section>
              ) : null}

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-red-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Rendimiento por turno
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowShiftReadings((current) => !current)}
                  >
                    {showShiftReadings ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showShiftReadings ? 'Ocultar lecturas' : 'Mostrar lecturas'}
                  </Button>
                </div>
                <ShiftGrid showReadings={showShiftReadings} />
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-red-600" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Detalle operativo
                  </h2>
                </div>
                <ShiftTablesContainer />
              </section>

              <MonthlyOperationalReport
                showGlobalReadings={showGlobalReadings}
                showShiftReadings={showShiftReadings}
              />

              <CommercialPerformancePanel />
            </TabsContent>

            <TabsContent value="analysis" className="focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
        )}
      </div>

      <KPIObserver />
      <Toaster />
    </main>
  );
}
