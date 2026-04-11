'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  calculateGlobalKpis,
  calculateKPIsByShift,
} from '@/ui/reports/analysis-beta/services/kpi.service';

export default function KPIObserver() {
  const allAnswered = useDashboardStore((state) => state.answeredCalls);
  const allAbandoned = useDashboardStore((state) => state.abandonedCalls);
  const allRawAbandoned = useDashboardStore((state) => state.rawAbandonedCalls);
  const allTransactions = useDashboardStore((state) => state.transactions);
  const dataDate = useDashboardStore((state) => state.dataDate);
  const setKPIs = useDashboardStore((state) => state.setKPIs);
  const setKPIsByShift = useDashboardStore((state) => state.setKPIsByShift);

  useEffect(() => {
    if (!dataDate) {
      setKPIs(calculateGlobalKpis([], [], []));
      setKPIsByShift(calculateKPIsByShift([], [], []));
      return;
    }

    // Filter data by selected date
    const answeredCalls = allAnswered.filter((r) => r.fecha === dataDate);
    const abandonedCalls = allAbandoned.filter((r) => r.fecha === dataDate);
    const rawAbandonedCalls = allRawAbandoned.filter((r) => r.fecha === dataDate);
    const transactions = allTransactions.filter((r) => r.fecha === dataDate);

    const globalKpis = calculateGlobalKpis(
      answeredCalls,
      abandonedCalls,
      transactions
    );
    setKPIs(globalKpis);

    const shiftKpis = calculateKPIsByShift(
      answeredCalls,
      rawAbandonedCalls,
      transactions
    );
    setKPIsByShift(shiftKpis);
  }, [
    allAnswered,
    allAbandoned,
    allRawAbandoned,
    allTransactions,
    dataDate,
    setKPIs,
    setKPIsByShift,
  ]);

  return null;
}
