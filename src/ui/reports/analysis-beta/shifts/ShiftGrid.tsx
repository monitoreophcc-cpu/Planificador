'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import ShiftCard from '@/ui/reports/analysis-beta/kpis/ShiftCard';
import type { ShiftKPIs } from '@/ui/reports/analysis-beta/types/dashboard.types';

type ShiftGridProps = {
  kpisByShift?: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  showReadings?: boolean;
};

export default function ShiftGrid({
  kpisByShift: providedKpisByShift,
  showReadings = false,
}: ShiftGridProps) {
  const storeKpisByShift = useDashboardStore((s) => s.kpisByShift);
  const kpisByShift = providedKpisByShift ?? storeKpisByShift;

  const hasData =
    kpisByShift.Día.recibidas > 0 || kpisByShift.Noche.recibidas > 0;
  if (!hasData) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ShiftCard name="Día" kpis={kpisByShift.Día} showReadings={showReadings} />
      <ShiftCard name="Noche" kpis={kpisByShift.Noche} showReadings={showReadings} />
    </section>
  );
}
