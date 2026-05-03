'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/reports/analysis-beta/ui/dialog';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import { FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { exportToCsv, exportToXlsx } from '@/ui/reports/analysis-beta/services/export.service';
import { useToast } from '@/ui/reports/analysis-beta/hooks/use-toast';
import { CallCenterReport } from '@/ui/reports/analysis-beta/reports/CallCenterReport';
import { downloadPdfDocument } from '@/ui/lib/downloadPdfDocument';

export default function ExportModal() {
  const allAns = useDashboardStore((state) => state.answeredCalls);
  const allAbn = useDashboardStore((state) => state.abandonedCalls);
  const allRawAbn = useDashboardStore((state) => state.rawAbandonedCalls);
  const allTrx = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const kpis = useDashboardStore((state) => state.kpis);
  const kpisByShift = useDashboardStore((state) => state.kpisByShift);
  const { toast } = useToast();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const hasData = dataDate !== null;

  const answeredCalls = allAns.filter(c => c.fecha === dataDate);
  const abandonedCalls = allAbn.filter(c => c.fecha === dataDate);
  const rawAbandonedCalls = allRawAbn.filter(c => c.fecha === dataDate);
  const transactions = allTrx.filter(c => c.fecha === dataDate);

  const handleExportCsv = () => {
    if (!hasData) return;
    try {
      exportToCsv({
        answeredCalls,
        abandonedCalls,
        rawAbandonedCalls,
        transactions,
      });
      toast({
        title: 'Exportación Exitosa',
        description: 'El reporte CSV ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudo generar el archivo CSV.',
      });
    }
  };

  const handleExportXlsx = async () => {
    if (!hasData) return;
    try {
      await exportToXlsx({
        answeredCalls,
        abandonedCalls,
        rawAbandonedCalls,
        transactions,
      });
      toast({
        title: 'Exportación Exitosa',
        description: 'El reporte de Excel ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to XLSX:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudo generar el archivo de Excel.',
      });
    }
  };

  const handleExportPdf = async () => {
    if (!hasData || isExportingPdf) return;

    setIsExportingPdf(true);

    try {
      await downloadPdfDocument({
        document: (
          <CallCenterReport kpis={kpis} kpisByShift={kpisByShift} date={dataDate} />
        ),
        fileName: `Call_Center_${dataDate || 'General'}.pdf`,
      });
      toast({
        title: 'Exportación Exitosa',
        description: 'El PDF ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudo generar el PDF.',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
          disabled={!hasData}
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Exportar
            </span>
            <span className="text-[11px] font-black text-slate-900">
              PDF, Excel o CSV
            </span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Opciones de Exportación</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex h-14 w-full items-center justify-start border-slate-200 text-lg font-semibold transition-all hover:bg-slate-50 hover:text-slate-900"
            disabled={isExportingPdf}
            onClick={handleExportPdf}
          >
            <FileText className="mr-4 h-6 w-6 text-slate-500" />
            {isExportingPdf ? 'Generando PDF...' : 'PDF (.pdf)'}
          </Button>
          <Button
            variant="outline"
            className="flex h-14 w-full items-center justify-start border-slate-200 text-lg font-semibold transition-all hover:bg-slate-50 hover:text-slate-900"
            disabled={!hasData}
            onClick={() => window.print()}
          >
            <Printer className="mr-4 h-6 w-6 text-slate-500" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-start h-14 text-lg font-semibold border-slate-200 hover:bg-slate-50 hover:text-green-600 transition-all"
            onClick={handleExportXlsx}
          >
            <FileSpreadsheet className="mr-4 h-6 w-6 text-green-500" />
            Excel (.xlsx)
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-start h-14 text-lg font-semibold border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all"
            onClick={handleExportCsv}
          >
            <FileText className="mr-4 h-6 w-6 text-blue-500" />
            CSV (.csv)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
