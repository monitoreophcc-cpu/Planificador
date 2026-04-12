'use client';

import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import { aggregateByTimeSlot } from '@/ui/reports/analysis-beta/services/kpi.service';
import ShiftDetailTable from './ShiftDetailTable';

export default function ShiftTablesContainer() {
  const answeredCalls = useDashboardStore((state) => state.answeredCalls);
  const abandonedCalls = useDashboardStore((state) => state.abandonedCalls);
  const transactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);

  const filteredAnswered = dataDate
    ? answeredCalls.filter((record) => record.fecha === dataDate)
    : [];
  const filteredAbandoned = dataDate
    ? abandonedCalls.filter((record) => record.fecha === dataDate)
    : [];
  const filteredTransactions = dataDate
    ? transactions.filter((record) => record.fecha === dataDate)
    : [];

  const hasData = filteredAnswered.length > 0 || filteredAbandoned.length > 0;
  if (!hasData) {
    return null;
  }

  const { day, night } = aggregateByTimeSlot(
    filteredAnswered,
    filteredAbandoned,
    filteredTransactions
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ShiftDetailTable title="Turno Día" data={day} />
      <ShiftDetailTable title="Turno Noche" data={night} />
    </section>
  );
}
