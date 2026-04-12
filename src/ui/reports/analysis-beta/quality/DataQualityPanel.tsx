'use client';

import { AlertTriangle, CheckCircle2, Database, FileSearch, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import { calculateAuditData } from '@/ui/reports/analysis-beta/services/audit.service';
import { buildDataQualitySummary } from '@/ui/reports/analysis-beta/services/executive.service';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/reports/analysis-beta/ui/dialog';
import { cn } from '@/ui/reports/analysis-beta/lib/utils';

function MiniTable({
  title,
  data,
  valueFormatter,
}: {
  title: string;
  data: Record<string, number>;
  valueFormatter?: (value: number) => string;
}) {
  const entries = Object.entries(data).sort((left, right) => right[1] - left[1]).slice(0, 6);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </h4>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-xs">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className="border-t border-slate-100 first:border-t-0">
                <td className="px-4 py-2.5 font-medium text-slate-600">{key}</td>
                <td className="px-4 py-2.5 text-right font-black text-slate-900">
                  {valueFormatter ? valueFormatter(value) : value.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DataQualityPanel() {
  const dataDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const rawTransactions = useDashboardStore((state) => state.rawTransactions);
  const validTransactions = useDashboardStore((state) => state.transactions);

  const snapshot = dataDate ? dailyHistory[dataDate] ?? null : null;
  const rawForDate = useMemo(
    () => (dataDate ? rawTransactions.filter((item) => item.fecha === dataDate) : []),
    [dataDate, rawTransactions]
  );
  const validForDate = useMemo(
    () => (dataDate ? validTransactions.filter((item) => item.fecha === dataDate) : []),
    [dataDate, validTransactions]
  );
  const quality = buildDataQualitySummary({
    snapshot,
    rawTransactions: rawForDate,
    validTransactions: validForDate,
  });
  const audit = calculateAuditData(rawForDate, validForDate);

  const tone =
    quality.level === 'ok'
      ? {
          chip: 'bg-emerald-50 text-emerald-700',
          iconBg: 'bg-emerald-100 text-emerald-700',
          Icon: CheckCircle2,
        }
      : quality.level === 'warning'
        ? {
            chip: 'bg-amber-50 text-amber-700',
            iconBg: 'bg-amber-100 text-amber-700',
            Icon: AlertTriangle,
          }
        : {
            chip: 'bg-red-50 text-red-700',
            iconBg: 'bg-red-100 text-red-700',
            Icon: ShieldAlert,
          };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', tone.iconBg)}>
            <tone.Icon className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                Calidad de datos
              </h2>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
                  tone.chip
                )}
              >
                {quality.label}
              </span>
            </div>
            <p className="max-w-3xl text-sm text-slate-500">{quality.detail}</p>
          </div>
        </div>

        {quality.level === 'ok' ? (
          <div className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            Estado estable
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-xl bg-slate-900 px-4 text-[11px] font-black uppercase tracking-[0.16em] hover:bg-slate-800">
                <FileSearch className="h-4 w-4 text-red-400" />
                Calidad de datos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[920px] rounded-[2rem] bg-slate-50 p-0">
              <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
                <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                  <Database className="h-5 w-5 text-red-600" />
                  Revisión de calidad de datos
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Estado de las fuentes cargadas y señales relevantes antes de compartir el reporte.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Cobertura
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        {
                          label: 'Contestadas',
                          loaded: snapshot?.coverage.answeredLoaded ?? false,
                        },
                        {
                          label: 'Abandonadas',
                          loaded: snapshot?.coverage.abandonedLoaded ?? false,
                        },
                        {
                          label: 'Transacciones',
                          loaded: snapshot?.coverage.transactionsLoaded ?? false,
                        },
                      ].map((item) => (
                        <span
                          key={item.label}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
                            item.loaded
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          )}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Registros
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total crudo</span>
                        <span className="font-black text-slate-900">
                          {audit.totalRecords.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total válido</span>
                        <span className="font-black text-slate-900">
                          {audit.validRecords.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monto válido</span>
                        <span className="font-black text-slate-900">
                          RD$ {audit.totalValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Observaciones
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      {quality.issues.length > 0 ? (
                        quality.issues.map((issue) => (
                          <p key={issue} className="rounded-xl bg-slate-50 px-3 py-2">
                            {issue}
                          </p>
                        ))
                      ) : (
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          No se detectaron observaciones críticas para la fecha activa.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <MiniTable title="Estatus crudos" data={audit.byStatus} />
                  <MiniTable title="Plataformas válidas" data={audit.byPlatform} />
                  <MiniTable
                    title="Ticket promedio por plataforma"
                    data={audit.aovByPlatform}
                    valueFormatter={(value) =>
                      `RD$ ${value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}
