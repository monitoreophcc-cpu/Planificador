'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Algo salió mal
          </h1>
          <p className="text-slate-500 text-sm">
            Ha ocurrido un error inesperado en la aplicación. Hemos sido notificados y estamos trabajando en ello.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-50 p-4 rounded-xl text-left overflow-auto max-h-40">
            <p className="text-[10px] font-mono text-slate-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold uppercase tracking-wider"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider text-xs"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
