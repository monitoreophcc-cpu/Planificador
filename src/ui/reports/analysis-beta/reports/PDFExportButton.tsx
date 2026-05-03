'use client';

import { useState, useEffect } from 'react';
import { CallCenterReport } from './CallCenterReport';
import { FileText } from 'lucide-react';
import { KPIs, ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';
import { downloadPdfDocument } from '@/ui/lib/downloadPdfDocument';

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
  const [isExporting, setIsExporting] = useState(false);

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
    <button
      disabled={isExporting}
      onClick={async () => {
        if (isExporting) {
          return;
        }

        setIsExporting(true);

        try {
          await downloadPdfDocument({
            document: <CallCenterReport kpis={kpis} kpisByShift={kpisByShift} date={date} />,
            fileName: `Call_Center_${date || 'General'}.pdf`,
          });
        } finally {
          setIsExporting(false);
        }
      }}
      className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
    >
      <FileText className="w-4 h-4 text-red-600" />
      {isExporting ? 'Generando...' : 'Exportar PDF'}
    </button>
  );
}
