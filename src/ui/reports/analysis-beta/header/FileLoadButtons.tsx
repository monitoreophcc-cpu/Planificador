'use client';

import { useRef } from 'react';
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import {
  Upload,
  Beaker,
  Search,
  Trash2,
  FileText,
  FileSpreadsheet,
  PhoneCall,
  PhoneOff,
  Coins,
  Printer,
} from 'lucide-react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  processAbandonedCalls,
  processAnsweredCalls,
  processTransactions,
  getUniqueDates,
} from '@/ui/reports/analysis-beta/services/parser.service';
import {
  demoAnsweredCalls,
  demoAbandonedCalls,
  demoTransactions,
} from '@/ui/reports/analysis-beta/lib/demo-data';
import { useToast } from '@/ui/reports/analysis-beta/hooks/use-toast';
import { exportToCsv, exportToXlsx } from '@/ui/reports/analysis-beta/services/export.service';

import ExportModal from './ExportModal';

export default function FileLoadButtons() {
  const addAnsweredCalls = useDashboardStore((state) => state.addAnsweredCalls);
  const addAbandonedCalls = useDashboardStore((state) => state.addAbandonedCalls);
  const addTransactions = useDashboardStore((state) => state.addTransactions);
  const toggleAudit = useDashboardStore((state) => state.toggleAudit);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const clearAllData = useDashboardStore((state) => state.clearAllData);
  const clearCurrentDate = useDashboardStore((state) => state.clearCurrentDate);
  const { toast } = useToast();

  const answeredInputRef = useRef<HTMLInputElement>(null);
  const abandonedInputRef = useRef<HTMLInputElement>(null);
  const transactionsInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'answered' | 'abandoned' | 'transactions'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      let data: any[];

      if (isCsv) {
        const { parseCsvFile } = await import('@/ui/reports/analysis-beta/services/parser.service');
        data = await parseCsvFile<any>(file);
      } else {
        const { parseXlsxFile } = await import('@/ui/reports/analysis-beta/services/parser.service');
        data = await parseXlsxFile<any>(file);
      }

      // --- VALIDATION LOGIC ---
      const uniqueDates = getUniqueDates(data);

      if (uniqueDates.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error de Validación',
          description: `El archivo ${file.name} no contiene fechas válidas.`,
        });
        return;
      }

      // --- END VALIDATION ---

      if (fileType === 'answered') {
        addAnsweredCalls(processAnsweredCalls(data), uniqueDates);
      } else if (fileType === 'abandoned') {
        const { clean, raw } = processAbandonedCalls(data);
        addAbandonedCalls({ clean, raw }, uniqueDates);
      } else if (fileType === 'transactions') {
        const { clean, raw } = processTransactions(data);
        addTransactions({ clean, raw }, uniqueDates);
      }

      toast({
        title: 'Archivo Cargado',
        description: `${file.name} ha sido procesado exitosamente. Se actualizaron los datos para: ${uniqueDates.join(', ')}`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `No se pudo procesar el archivo ${file.name}.`;

      console.warn('File parsing warning:', message);
      toast({
        variant: 'destructive',
        title: 'Error de Procesamiento',
        description: message,
      });
    } finally {
      if (event.currentTarget) {
        event.currentTarget.value = '';
      }
    }
  };

  const handleLoadDemoData = () => {
    const dates = getUniqueDates(demoAnsweredCalls);
    
    addAnsweredCalls(processAnsweredCalls(demoAnsweredCalls), dates);
    const { clean: cleanAbandoned, raw: rawAbandoned } = processAbandonedCalls(
      demoAbandonedCalls as any[]
    );
    addAbandonedCalls({ clean: cleanAbandoned, raw: rawAbandoned }, dates);
    const { clean: cleanTrans, raw: rawTrans } = processTransactions(
      demoTransactions as any[]
    );
    addTransactions({ clean: cleanTrans, raw: rawTrans }, dates);

    toast({ title: 'Datos de Demostración Cargados' });
  };

  const handleClearAllData = () => {
    clearAllData();
    toast({
      title: 'Historial Limpiado',
      description: 'Todos los datos han sido eliminados.',
    });
  };

  const handleClearCurrentDate = () => {
    clearCurrentDate();
    toast({
      title: 'Día Limpiado',
      description: `Los datos del día ${dataDate} han sido eliminados.`,
    });
  };

  const commonFileTypes =
    '.csv,.xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12';

  return (
    <>
      <input
        type="file"
        ref={answeredInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'answered')}
      />
      <input
        type="file"
        ref={abandonedInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'abandoned')}
      />
      <input
        type="file"
        ref={transactionsInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'transactions')}
      />
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 whitespace-nowrap"
          onClick={() => answeredInputRef.current?.click()}
        >
          <PhoneCall className="mr-2 h-4 w-4 text-red-500" />
          Cargar Contestadas
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 whitespace-nowrap"
          onClick={() => abandonedInputRef.current?.click()}
        >
          <PhoneOff className="mr-2 h-4 w-4 text-red-500" />
          Cargar Abandonadas
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 whitespace-nowrap"
          onClick={() => transactionsInputRef.current?.click()}
        >
          <Coins className="mr-2 h-4 w-4 text-yellow-500" />
          Cargar Transacciones
        </Button>
        <ExportModal />

        <Button 
          variant="default" 
          size="icon" 
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg h-9 w-9"
          onClick={handleLoadDemoData}
          title="Cargar Datos Demo"
        >
          <Beaker className="h-4 w-4" />
          <span className="sr-only">Demo</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 h-9 w-9"
          onClick={handleClearCurrentDate}
          onDoubleClick={handleClearAllData}
          title="Click: Limpiar Día | Doble Click: Limpiar Todo"
        >
          <Trash2 className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Limpiar</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 h-9 w-9"
          onClick={toggleAudit}
          title="Auditoría"
        >
          <Search className="h-4 w-4 text-blue-400" />
          <span className="sr-only">Auditoría</span>
        </Button>
      </div>
    </>
  );
}
