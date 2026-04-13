'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CallCenterReport } from './CallCenterReport';
import { FileText } from 'lucide-react';
import { KPIs, ShiftKPIs } from '@/types/dashboard.types';

interface PDFExportButtonProps {
  kpis: KPIs;
  kpisByShift: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  date: string | null;
}

export default function PDFExportButton({ kpis, kpisByShift, date }: PDFExportButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider opacity-50">
      <FileText className="w-4 h-4 text-red-600" />
      Exportar PDF
    </div>
  );

  return (
    <PDFDownloadLink
      document={<CallCenterReport kpis={kpis} kpisByShift={kpisByShift} date={date} />}
      fileName={`Reporte_MonitoreoCC_${date || 'General'}.pdf`}
    >
      {({ loading }) => (
        <button 
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <FileText className="w-4 h-4 text-red-600" />
          {loading ? 'Generando...' : 'Exportar PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
