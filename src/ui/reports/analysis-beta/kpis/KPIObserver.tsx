'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/ui/reports/analysis-beta/store/dashboard.store';
import {
  calculateGlobalKpis,
  calculateKPIsByShift,
} from '@/ui/reports/analysis-beta/services/kpi.service';

export default function KPIObserver() {
  const dataDate = useDashboardStore((state) => state.dataDate);
  const dailyHistory = useDashboardStore((state) => state.dailyHistory);
  const setKPIs = useDashboardStore((state) => state.setKPIs);
  const setKPIsByShift = useDashboardStore((state) => state.setKPIsByShift);

  useEffect(() => {
    if (!dataDate) {
      setKPIs(calculateGlobalKpis([], [], []));
      setKPIsByShift(calculateKPIsByShift([], [], []));
      return;
    }

    const snapshot = dailyHistory[dataDate];

    if (!snapshot) {
      setKPIs(calculateGlobalKpis([], [], []));
      setKPIsByShift(calculateKPIsByShift([], [], []));
      return;
    }

    setKPIs(snapshot.kpis);
    setKPIsByShift(snapshot.shiftKpis);
  }, [
    dataDate,
    dailyHistory,
    setKPIs,
    setKPIsByShift,
  ]);

  return null;
}
