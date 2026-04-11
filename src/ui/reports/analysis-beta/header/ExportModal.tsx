'use client';

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

export default function ExportModal() {
  const allAns = useDashboardStore((state) => state.answeredCalls);
  const allAbn = useDashboardStore((state) => state.abandonedCalls);
  const allRawAbn = useDashboardStore((state) => state.rawAbandonedCalls);
  const allTrx = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const { toast } = useToast();

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

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 whitespace-nowrap"
          disabled={!hasData}
        >
          <Download className="mr-2 h-4 w-4 text-blue-400" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Opciones de Exportación</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button
            variant="outline"
            className="flex items-center justify-start h-14 text-lg font-semibold border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
            onClick={handleExportPdf}
          >
            <Printer className="mr-4 h-6 w-6 text-slate-500" />
            PDF (Imprimir)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

