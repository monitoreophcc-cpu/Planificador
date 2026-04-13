'use client';

import { useMemo } from 'react';
import { BarChart3, CalendarRange, GitCompareArrows } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import KPISummary from '@/ui/reports/analysis-beta/kpis/KPISummary';
import ShiftGrid from '@/ui/reports/analysis-beta/shifts/ShiftGrid';
import ShiftTablesContainer from '@/ui/reports/analysis-beta/tables/ShiftTablesContainer';
import {
  buildMonthlyOperationalReport,
  getPreviousMonthlyOperationalReport,
} from '@/ui/reports/analysis-beta/services/monthly-report.service';

type MonthlyOperationalReportProps = {
  showGlobalReadings?: boolean;
  showShiftReadings?: boolean;
};

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}

export default function MonthlyOperationalReport({
  showGlobalReadings = false,
  showShiftReadings = false,
}: MonthlyOperationalReportProps) {
  const dataDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);

  const monthlyReport = useMemo(
    () => buildMonthlyOperationalReport(dailyHistory, dataDate),
    [dailyHistory, dataDate]
  );
  const previousMonthlyReport = useMemo(
    () => getPreviousMonthlyOperationalReport(dailyHistory, dataDate),
    [dailyHistory, dataDate]
  );

  if (!monthlyReport) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-red-600" />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Informe mensual acumulado
        </h2>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <BarChart3 className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                  Lectura mensual
                </p>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {monthlyReport.monthLabel}
              </h3>
              <p className="text-sm text-slate-500">
                El informe suma y promedia todo lo cargado del mes activo para mostrar cómo va cerrando la operación en sentido general.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm">
                <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                {monthlyReport.loadedDays}/{monthlyReport.expectedDays} días cargados
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm">
                {formatDisplayDate(monthlyReport.startDate)} al {formatDisplayDate(monthlyReport.endDate)}
              </span>
              {previousMonthlyReport ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-red-700">
                  <GitCompareArrows className="h-3.5 w-3.5" />
                  Base comparativa: {previousMonthlyReport.monthLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-5 py-6">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Rendimiento global del mes
            </h3>
            <KPISummary
              currentKpis={monthlyReport.kpis}
              previousKpis={previousMonthlyReport?.kpis ?? null}
              showReadings={showGlobalReadings}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Rendimiento por turno del mes
            </h3>
            <ShiftGrid
              kpisByShift={monthlyReport.shiftKpis}
              showReadings={showShiftReadings}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Detalle operativo del mes
            </h3>
            <ShiftTablesContainer detail={monthlyReport.operationalDetail} />
          </div>
        </div>
      </div>
    </section>
  );
}
