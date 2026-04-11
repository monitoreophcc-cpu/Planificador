'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { EmptyState } from '@/ui/reports/analysis-beta/ui/EmptyState';
import { useOperationalDashboardStore, OperationalStore } from '@/ui/reports/analysis-beta/store/useOperationalDashboardStore';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Database,
  FolderCheck,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import KPISummary from '@/ui/reports/analysis-beta/kpis/KPISummary';
import FileLoadButtons from '@/ui/reports/analysis-beta/header/FileLoadButtons';
import { DateRangeDisplay } from '@/ui/reports/analysis-beta/header/DateRangeDisplay';
import { DashboardControls } from '@/ui/reports/analysis-beta/header/DashboardControls';
import ShiftGrid from '@/ui/reports/analysis-beta/shifts/ShiftGrid';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/reports/analysis-beta/ui/tabs';
import ShiftTablesContainer from '@/ui/reports/analysis-beta/tables/ShiftTablesContainer';
import { Toaster } from '@/ui/reports/analysis-beta/ui/toaster';
import ShiftPerformanceChart from '@/ui/reports/analysis-beta/charts/ShiftPerformanceChart';
import HourlyDistributionChart from '@/ui/reports/analysis-beta/charts/HourlyDistributionChart';
import PlatformTransactionsChart from '@/ui/reports/analysis-beta/charts/PlatformTransactionsChart';
import PlatformSalesChart from '@/ui/reports/analysis-beta/charts/PlatformSalesChart';
import PlatformAovChart from '@/ui/reports/analysis-beta/charts/PlatformAovChart';
import TopBranchesChart from '@/ui/reports/analysis-beta/charts/TopBranchesChart';
import HourlyAbandonmentRateChart from '@/ui/reports/analysis-beta/charts/HourlyAbandonmentRateChart';
import HourlyConversionRateChart from '@/ui/reports/analysis-beta/charts/HourlyConversionRateChart';
import DailyVolumeChart from '@/ui/reports/analysis-beta/charts/DailyVolumeChart';
import CallCenterVolumeCards from '@/ui/reports/analysis-beta/stats/CallCenterVolumeCards';

const AgentPerformanceTable = dynamic(
  () => import('@/ui/reports/analysis-beta/agents/AgentPerformanceTable').then(mod => mod.AgentPerformanceTable),
  { ssr: false, loading: () => <LoadingPanel label="Cargando rendimiento por representante..." /> }
);
const CorrelationView = dynamic(
  () => import('@/ui/reports/analysis-beta/correlation/CorrelationView'),
  { ssr: false, loading: () => <LoadingPanel label="Cargando correlación operativa..." tall /> }
);
const AuditView = dynamic(
  () => import('@/ui/reports/analysis-beta/audit/AuditView'),
  { ssr: false }
);

export function CallCenterAnalysisView() {
  const { status, scope, data } = useOperationalDashboardStore((state: OperationalStore) => ({
    status: state.status,
    scope: state.scope,
    data: state.data,
  }));

  const hasData =
    data.answered.length > 0 ||
    data.abandoned.clean.length > 0 ||
    data.transactions.length > 0;

  const range = scope.range;
  const rangeLabel = !range
    ? 'Pendiente'
    : range.from === range.to
      ? range.from
      : `${range.from} - ${range.to}`;

  const fileCoverage = [
    data.answered.length > 0 ? 'Contestadas' : null,
    data.abandoned.clean.length > 0 ? 'Abandonadas' : null,
    data.transactions.length > 0 ? 'Transacciones' : null,
  ].filter(Boolean).join(' · ') || 'Sin archivos listos';

  const duplicateCount = data.stats?.duplicates ?? 0;
  const ignoredCount = data.stats?.ignored ?? 0;
  const predictedSegments = data.predictedLoad?.length ?? 0;
  const attributedAgents = data.salesAttribution?.byAgent.length ?? 0;
  const hasPrediction = predictedSegments > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-white px-5 py-6 md:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                  Beta operativa
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  {status === 'READY' ? 'Sesión lista' : status === 'ANALYZING' ? 'Procesando' : 'Carga pendiente'}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  Monitoreo Call Center
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">
                  Consolida contestadas, abandonadas y transacciones en un solo tablero con KPIs,
                  tendencias horarias, trazabilidad por representante y correlación con la capacidad
                  operativa planificada.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 xl:items-end">
              {range && <DateRangeDisplay />}
              {hasPrediction && <DashboardControls />}
              <FileLoadButtons />
            </div>
          </div>
        </div>

        <div className="grid gap-3 bg-gradient-to-br from-slate-50 via-white to-amber-50 px-5 py-5 md:grid-cols-2 md:px-8 xl:grid-cols-4">
          <MetaBlock
            icon={FolderCheck}
            label="Cobertura validada"
            value={rangeLabel}
            description={range ? 'Rango único validado entre archivos cargados.' : 'Se define al validar fechas y coherencia entre archivos.'}
          />
          <MetaBlock
            icon={Database}
            label="Fuente activa"
            value={scope.source === 'GENERIC_CSV' ? 'Carga local' : scope.source === 'MASTER_EXCEL' ? 'Excel maestro' : 'Sin sesión'}
            description={fileCoverage}
          />
          <MetaBlock
            icon={ShieldCheck}
            label="Integridad transaccional"
            value={`${ignoredCount} anuladas · ${duplicateCount} duplicadas`}
            description={hasData ? 'La sesión aplica filtros antes de consolidar KPIs y tablas.' : 'Todavía no hay una corrida lista para auditar.'}
          />
          <MetaBlock
            icon={BrainCircuit}
            label="Señal avanzada"
            value={hasPrediction ? `${predictedSegments} bloques proyectados` : `${attributedAgents} reps atribuidos`}
            description={hasPrediction ? 'La proyección de 7 días ya puede verse en gráficos clave.' : 'La beta ya separa ventas atribuibles del resto de canales.'}
          />
        </div>
      </section>

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="correlacion">Correlación</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-6">
          {!hasData ? (
            <EmptyPane />
          ) : (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Resumen operativo"
                title="Lectura inmediata del rango cargado"
                description="La beta concentra servicio, distribución por turno y detalle operativo en una sola vista para revisar la sesión antes de bajar a gráficos o correlación."
              />
              <KPISummary />
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <ShiftGrid />
                <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Estado de la sesión
                      </div>
                      <h3 className="mt-2 text-lg font-black text-slate-900">
                        {status === 'READY' ? 'Lista para explorar' : status === 'ANALYZING' ? 'Procesando archivos' : 'Esperando carga'}
                      </h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Archivos activos
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {fileCoverage}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                          Predicción 7d
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {hasPrediction ? `${predictedSegments} bloques` : 'No disponible'}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                          Atribución CC
                        </div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {attributedAgents > 0 ? `${attributedAgents} representantes` : 'Sin ventas atribuibles'}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <ShiftTablesContainer />
            </div>
          )}
        </TabsContent>

        <TabsContent value="graficos" className="mt-6">
          {!hasData ? (
            <EmptyPane
              title="Gráficos todavía no disponibles"
              description="Carga una sesión válida para dibujar tendencias, abandono, conversión y mezcla por plataforma."
              icon={BarChart3}
            />
          ) : (
            <div className="space-y-8">
              <SectionHeader
                eyebrow="Vista analítica"
                title="Volumen, eficiencia y mezcla digital"
                description="Tomamos la composición más pulida del prototipo de docs, pero preservando la lógica y validaciones que ya trae esta beta."
              />

              <div>
                <SectionMarker title="Call Center" />
                <div className="mt-4 space-y-6">
                  <CallCenterVolumeCards />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <DailyVolumeChart />
                    <ShiftPerformanceChart />
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <HourlyDistributionChart />
                    <HourlyAbandonmentRateChart />
                  </div>
                  <HourlyConversionRateChart />
                </div>
              </div>

              <div>
                <SectionMarker title="Plataformas digitales" />
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <PlatformTransactionsChart />
                  <PlatformSalesChart />
                </div>
                <div className="mt-6">
                  <PlatformAovChart />
                </div>
              </div>

              <div>
                <SectionMarker title="Sucursales" />
                <div className="mt-4">
                  <TopBranchesChart />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transacciones" className="mt-6">
          {!hasData ? (
            <EmptyPane
              title="Transacciones aún sin sesión"
              description="La tabla acumulativa se habilita cuando la beta procesa ventas válidas y puede agruparlas por representante."
              icon={Activity}
            />
          ) : (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Rendimiento acumulado"
                title="Representantes y cierre comercial"
                description="Aquí se mantiene la lectura acumulativa del mes para revisar transacciones, ticket promedio y volumen neto por representante."
              />
              <AgentPerformanceTable />
            </div>
          )}
        </TabsContent>

        <TabsContent value="correlacion" className="mt-6">
          {!hasData ? (
            <EmptyPane
              title="Correlación operativa pendiente"
              description="Cuando exista una sesión validada, la beta puede cruzar carga recibida con capacidad operativa y semáforo de riesgo."
              icon={BrainCircuit}
            />
          ) : (
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Capacidad vs realidad"
                title="Cruce entre demanda, staffing y ventas atribuibles"
                description="Esta parte conecta el dashboard de llamadas con el contexto operativo de la planificación para mostrar tensión real del servicio."
              />
              <CorrelationView />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AuditView />
      <Toaster />
    </div>
  );
}

function MetaBlock({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="text-lg font-black leading-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        {eyebrow}
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function SectionMarker({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-1 rounded-full bg-amber-500" />
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h4>
    </div>
  );
}

function EmptyPane({
  title = 'Aún no hay una sesión de análisis',
  description = 'Carga los archivos de contestadas, abandonadas y transacciones. La beta procesa, valida y guarda el resultado automáticamente para reutilizarlo desde el historial.',
  icon = Upload,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-6">
      <EmptyState title={title} description={description} icon={icon} />

      <div className="grid gap-3 md:grid-cols-3">
        <MetaBlock
          icon={Upload}
          label="Carga guiada"
          value="Archivos validados"
          description="Cada archivo se revisa por nombre y por coherencia de fechas antes de consolidar la sesión."
        />
        <MetaBlock
          icon={ShieldCheck}
          label="Integridad primero"
          value="KPIs protegidos"
          description="La beta filtra anuladas, duplicadas y mezcla inconsistente para evitar lectura falsa."
        />
        <MetaBlock
          icon={Database}
          label="Historial local"
          value="Sesiones recuperables"
          description="Puedes volver a una corrida anterior sin reprocesar todo desde cero."
        />
      </div>
    </div>
  );
}

function LoadingPanel({
  label,
  tall = false,
}: {
  label: string;
  tall?: boolean;
}) {
  return (
    <div className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm ${tall ? 'min-h-[420px]' : 'min-h-[240px]'}`}>
      <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-slate-200" />
      <div className="space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
        <div className={`mt-8 animate-pulse rounded-[18px] bg-slate-100 ${tall ? 'h-64' : 'h-32'}`} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
