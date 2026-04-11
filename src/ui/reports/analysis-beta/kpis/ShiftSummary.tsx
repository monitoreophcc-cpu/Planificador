'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import ShiftCard from './ShiftCard';

export default function ShiftSummary() {
  const kpisByShift = useDashboardStore((s) => s.kpisByShift);

  const shiftEntries = Object.entries(kpisByShift);

  const hasData = shiftEntries.some(([_, kpis]) => kpis.recibidas > 0);
  if (!hasData) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Análisis por Turno</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shiftEntries.map(([name, kpis]) => (
          <ShiftCard key={name} name={name} kpis={kpis} />
        ))}
      </div>
    </section>
  );
}
