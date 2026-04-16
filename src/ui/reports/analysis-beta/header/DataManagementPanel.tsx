'use client';

import { useRef } from 'react';
import {
  Beaker,
  Coins,
  Database,
  FolderUp,
  History,
  PhoneCall,
  PhoneOff,
  Trash2,
} from 'lucide-react';
import { useAccess } from '@/hooks/useAccess';
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
import { Button } from '@/ui/reports/analysis-beta/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/reports/analysis-beta/ui/dialog';

function summarizeLoadedDates(dates: string[]): string {
  const sortedDates = [...dates].sort();

  if (sortedDates.length <= 3) {
    return sortedDates.join(', ');
  }

  return `${sortedDates.length} fechas (${sortedDates[0]} a ${sortedDates[sortedDates.length - 1]})`;
}

export default function DataManagementPanel() {
  const { canEditData } = useAccess();
  const addAnsweredCalls = useDashboardStore((state) => state.addAnsweredCalls);
  const addAbandonedCalls = useDashboardStore((state) => state.addAbandonedCalls);
  const addTransactions = useDashboardStore((state) => state.addTransactions);
  const clearCurrentView = useDashboardStore((state) => state.clearCurrentView);
  const clearAllData = useDashboardStore((state) => state.clearAllData);
  const availableDates = useDashboardStore((state) => state.availableDates);
  const dataDate = useDashboardStore((state) => state.dataDate);
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

      const uniqueDates = getUniqueDates(data);

      if (uniqueDates.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error de Validación',
          description: `El archivo ${file.name} no contiene fechas válidas.`,
        });
        return;
      }

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
        description: `${file.name} ha sido procesado exitosamente. Se actualizaron los datos para: ${summarizeLoadedDates(uniqueDates)}`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `No se pudo procesar el archivo ${file.name}.`;

      toast({
        variant: 'destructive',
        title: 'Error de Procesamiento',
        description: message,
      });
    } finally {
      event.currentTarget.value = '';
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

    toast({ title: 'Datos de demostración cargados' });
  };

  const handleClearCurrentView = () => {
    clearCurrentView();
    toast({
      title: 'Vista limpiada',
      description: dataDate
        ? `La vista principal de ${dataDate} se limpió, pero el historial sigue guardado.`
        : 'La vista principal se limpió. El historial sigue guardado.',
    });
  };

  const handleClearHistory = () => {
    if (!window.confirm('¿Borrar todo el historial cargado? Esta acción sí elimina los datos guardados.')) {
      return;
    }

    clearAllData();
    toast({
      title: 'Historial eliminado',
      description: 'Todos los días cargados fueron eliminados explícitamente.',
    });
  };

  const commonFileTypes =
    '.csv,.xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12';

  const loaders = [
    {
      label: 'Contestadas',
      description: 'Carga el archivo operativo de llamadas contestadas.',
      Icon: PhoneCall,
      accent: 'text-red-600',
      onClick: () => answeredInputRef.current?.click(),
    },
    {
      label: 'Abandonadas',
      description: 'Carga el archivo de llamadas abandonadas para auditoría y SL.',
      Icon: PhoneOff,
      accent: 'text-red-600',
      onClick: () => abandonedInputRef.current?.click(),
    },
    {
      label: 'Transacciones',
      description: 'Carga el archivo comercial con representantes y plataformas.',
      Icon: Coins,
      accent: 'text-amber-600',
      onClick: () => transactionsInputRef.current?.click(),
    },
  ];

  if (!canEditData) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-2xl border-slate-200 bg-white px-4 hover:bg-slate-50"
        >
          <Database className="h-4 w-4 text-slate-500" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Administrar datos
            </span>
            <span className="text-[11px] font-black text-slate-900">
              Cargar y mantener
            </span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[980px] rounded-[2rem] bg-white p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
            <Database className="h-5 w-5 text-red-600" />
            Administración de datos
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Aquí viven la carga de archivos, la limpieza no destructiva de la vista y las acciones avanzadas sobre el historial.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          ref={answeredInputRef}
          className="hidden"
          accept={commonFileTypes}
          onChange={(event) => handleFileChange(event, 'answered')}
        />
        <input
          type="file"
          ref={abandonedInputRef}
          className="hidden"
          accept={commonFileTypes}
          onChange={(event) => handleFileChange(event, 'abandoned')}
        />
        <input
          type="file"
          ref={transactionsInputRef}
          className="hidden"
          accept={commonFileTypes}
          onChange={(event) => handleFileChange(event, 'transactions')}
        />

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-red-600" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Carga de archivos
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {loaders.map((loader) => (
                <button
                  key={loader.label}
                  type="button"
                  onClick={loader.onClick}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white ${loader.accent}`}>
                      <loader.Icon className="h-5 w-5" />
                    </div>
                    <FolderUp className="h-4 w-4 text-slate-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    {loader.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {loader.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Estado actual
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fecha activa</span>
                  <span className="font-black text-slate-900">{dataDate ?? 'Sin selección'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fechas guardadas</span>
                  <span className="font-black text-slate-900">
                    {availableDates.length.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Mantenimiento
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Limpia la vista para cargar nuevos archivos sin tocar el historial persistido.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 w-full rounded-xl border-slate-200 text-[11px] font-black uppercase tracking-[0.16em]"
                disabled={!dataDate}
                onClick={handleClearCurrentView}
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
                Limpiar vista principal
              </Button>
            </div>

            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                Avanzado
              </p>
              <p className="mt-3 text-sm text-amber-900">
                Las acciones de demo y borrado explícito viven aquí para no competir con el flujo principal.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-amber-200 bg-white text-[11px] font-black uppercase tracking-[0.16em] text-amber-800 hover:bg-amber-100"
                  onClick={handleLoadDemoData}
                >
                  <Beaker className="h-4 w-4" />
                  Cargar demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-red-200 bg-white text-[11px] font-black uppercase tracking-[0.16em] text-red-700 hover:bg-red-50"
                  onClick={handleClearHistory}
                >
                  <History className="h-4 w-4" />
                  Borrar historial completo
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
