'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import type { TimeSlotKpi } from '@/ui/reports/analysis-beta/types/dashboard.types';
import ShiftDetailTable from './ShiftDetailTable';

type ShiftTablesContainerProps = {
  detail?: {
    day: TimeSlotKpi[];
    night: TimeSlotKpi[];
  } | null;
};

export default function ShiftTablesContainer({ detail }: ShiftTablesContainerProps) {
  const dataDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);

  const resolvedDetail =
    detail ?? (dataDate ? dailyHistory[dataDate]?.operationalDetail ?? null : null);

  if (!resolvedDetail) {
    return null;
  }

  const hasData =
    resolvedDetail.day.some((row) => row.recibidas > 0 || row.abandonadas > 0) ||
    resolvedDetail.night.some((row) => row.recibidas > 0 || row.abandonadas > 0);

  if (!hasData) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ShiftDetailTable title="Turno Día" data={resolvedDetail.day} />
      <ShiftDetailTable title="Turno Noche" data={resolvedDetail.night} />
    </section>
  );
}
