'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { calculateAuditData } from '@/ui/reports/analysis-beta/services/audit.service';
import { ShieldCheck, Info } from 'lucide-react';

const AuditTable = ({
  data,
  valueFormatter,
}: {
  data: Record<string, number>;
  valueFormatter?: (value: number) => string | number;
}) => {
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <table className="w-full text-xs border-collapse">
        <tbody className="divide-y divide-slate-50">
          {sortedData.map(([key, value]) => (
            <tr key={key} className="hover:bg-slate-50 transition-colors">
              <td className="p-2 text-slate-600 font-medium">{key}</td>
              <td className="p-2 text-right font-black text-slate-900">
                {valueFormatter
                  ? valueFormatter(value)
                  : value.toLocaleString('es-DO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function AuditView() {
  const isAuditVisible = useDashboardStore((state) => state.isAuditVisible);
  const allRaw = useDashboardStore((state) => state.rawTransactions);
  const allValid = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);

  if (!isAuditVisible || allRaw.length === 0) {
    return null;
  }

  const rawTransactions = allRaw.filter(r => r.fecha === dataDate);
  const validTransactions = allValid.filter(r => r.fecha === dataDate);

  if (rawTransactions.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
        <CardContent className="p-6 text-center text-xs font-bold text-amber-800">
          No hay datos de auditoría para esta fecha.
        </CardContent>
      </Card>
    );
  }

  const auditData = calculateAuditData(rawTransactions, validTransactions);
  const formatCurrency = (val: number) =>
    val.toLocaleString('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
    });

  return (
    <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
      <CardHeader className="border-b border-amber-100 py-4">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-amber-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          Auditoría de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-100 shadow-sm">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Rango Detectado</p>
              <p className="text-xs font-black text-slate-900">{auditData.dateRange}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-tighter">Registros Totales</span>
            <span className="font-black text-slate-900">{auditData.totalRecords.toLocaleString('es-DO')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-tighter">Registros Válidos</span>
            <span className="font-black text-slate-900">{auditData.validRecords.toLocaleString('es-DO')}</span>
          </div>
          <div className="h-px bg-amber-100" />
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-tighter">Monto Total</span>
            <span className="font-black text-red-600">{formatCurrency(auditData.totalValue)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus Crudos</h4>
          <AuditTable data={auditData.byStatus} />
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Promedio</h4>
          <AuditTable
            data={auditData.aovByPlatform}
            valueFormatter={(v) => formatCurrency(v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

