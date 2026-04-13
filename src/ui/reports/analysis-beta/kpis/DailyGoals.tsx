'use client';

import { Target } from 'lucide-react';

export default function DailyGoals() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <Target className="w-4 h-4 text-red-600" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
          Objetivos del Día
        </h3>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Nivel de Servicio</span>
            <span className="text-red-600">Meta: 97.5%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.3)]" style={{ width: '95%' }} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Tasa de Abandono</span>
            <span className="text-red-600">Meta: &lt; 4%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full" style={{ width: '12%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
