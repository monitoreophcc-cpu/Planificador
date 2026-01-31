'use client';

import { EmptyState } from '@/ui/reports/analysis-beta/ui/EmptyState';
import { useOperationalDashboardStore, OperationalStore } from '@/store/useOperationalDashboardStore';
import { BarChart3, Upload } from 'lucide-react';
import KPISummary from '@/ui/reports/analysis-beta/kpis/KPISummary';
import FileLoadButtons from '@/ui/reports/analysis-beta/header/FileLoadButtons';
import ShiftGrid from '@/ui/reports/analysis-beta/shifts/ShiftGrid';
import KPIObserver from '@/ui/reports/analysis-beta/kpis/KPIObserver';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/ui/reports/analysis-beta/ui/tabs';
import ShiftTablesContainer from '@/ui/reports/analysis-beta/tables/ShiftTablesContainer';
import DateRangeBadge from '@/ui/reports/analysis-beta/header/DateRangeBadge';
import { DashboardControls } from '@/ui/reports/analysis-beta/header/DashboardControls';
import { Toaster } from '@/ui/reports/analysis-beta/ui/toaster';

import ShiftPerformanceChart from '@/ui/reports/analysis-beta/charts/ShiftPerformanceChart';
import HourlyDistributionChart from '@/ui/reports/analysis-beta/charts/HourlyDistributionChart';
import PlatformTransactionsChart from '@/ui/reports/analysis-beta/charts/PlatformTransactionsChart';
import PlatformSalesChart from '@/ui/reports/analysis-beta/charts/PlatformSalesChart';
import PlatformAovChart from '@/ui/reports/analysis-beta/charts/PlatformAovChart';
import TopBranchesChart from '@/ui/reports/analysis-beta/charts/TopBranchesChart';
import HourlyAbandonmentRateChart from '@/ui/reports/analysis-beta/charts/HourlyAbandonmentRateChart';
import HourlyConversionRateChart from '@/ui/reports/analysis-beta/charts/HourlyConversionRateChart';
import AuditView from '@/ui/reports/analysis-beta/audit/AuditView';
import CorrelationView from '@/ui/reports/analysis-beta/correlation/CorrelationView';

export function CallCenterAnalysisView() {
    const dataDate = useOperationalDashboardStore((state: OperationalStore) => state.dataDate);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex flex-col gap-2">
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                        Análisis Operativo de Llamadas
                    </h2>
                    {dataDate && <DateRangeBadge />}
                </div>
                <div className="flex items-center gap-4">
                    <DashboardControls />
                    <FileLoadButtons />
                </div>
            </div>

            <Tabs defaultValue="main">
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="main">General</TabsTrigger>
                    <TabsTrigger value="analysis">Gráficos</TabsTrigger>
                    <TabsTrigger value="correlation">Carga vs Capacidad</TabsTrigger>
                </TabsList>
                <TabsContent value="main" className="space-y-6 mt-4">
                    {!dataDate ? (
                        <EmptyState
                            title="No hay datos cargados"
                            description="Carga tus archivos Excel (Contestadas, Abandonadas, Transacciones) para comenzar."
                            icon={Upload}
                        />
                    ) : (
                        <>
                            <KPISummary />
                            <ShiftGrid />
                            <ShiftTablesContainer />
                        </>
                    )}
                </TabsContent>
                <TabsContent value="analysis" className="mt-4">
                    {!dataDate ? (
                        <EmptyState
                            title="Análisis no disponible"
                            description="Se requieren datos cargados para generar las gráficas de rendimiento."
                            icon={BarChart3}
                        />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ShiftPerformanceChart />
                            <HourlyDistributionChart />
                            <HourlyAbandonmentRateChart />
                            <HourlyConversionRateChart />
                            <PlatformTransactionsChart />
                            <PlatformSalesChart />
                            <PlatformAovChart />
                            <TopBranchesChart />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="correlation" className="mt-4">
                    <CorrelationView />
                </TabsContent>
            </Tabs>
            <AuditView />
            <KPIObserver />
            <Toaster />
        </div>
    );
}
