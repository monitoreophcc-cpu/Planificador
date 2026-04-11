'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import ShiftCard from '@/ui/reports/analysis-beta/kpis/ShiftCard';

export default function ShiftGrid() {
  const kpisByShift = useDashboardStore((s) => s.kpisByShift);

  const hasData =
    kpisByShift.Día.recibidas > 0 || kpisByShift.Noche.recibidas > 0;
  if (!hasData) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ShiftCard name="Día" kpis={kpisByShift.Día} />
      <ShiftCard name="Noche" kpis={kpisByShift.Noche} />
    </section>
  );
}
