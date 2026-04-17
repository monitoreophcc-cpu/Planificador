import type {
  DailySnapshot,
  KPIs,
  MonthlyOperationalSnapshot,
  ShiftKPIs,
  TimeSlotKpi,
} from '@/ui/reports/analysis-beta/types/dashboard.types';

function parseUtcDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function buildMonthBounds(referenceDate: string) {
  const date = parseUtcDate(referenceDate);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const month = String(monthIndex + 1).padStart(2, '0');
  const monthKey = `${year}-${month}`;
  const startDate = `${monthKey}-01`;
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 0))
    .toISOString()
    .slice(0, 10);

  return {
    monthKey,
    startDate,
    endDate,
    expectedDays: parseUtcDate(endDate).getUTCDate(),
    monthLabel: new Intl.DateTimeFormat('es-DO', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, monthIndex, 1))),
  };
}

function sumMonthlyKpis(snapshots: DailySnapshot[]): KPIs {
  const totals = snapshots.reduce(
    (accumulator, snapshot) => {
      accumulator.recibidas += snapshot.kpis.recibidas;
      accumulator.contestadas += snapshot.kpis.contestadas;
      accumulator.abandonadas += snapshot.kpis.abandonadas;
      accumulator.transaccionesCC += snapshot.kpis.transaccionesCC;
      accumulator.ventasValidas += snapshot.kpis.ventasValidas;
      return accumulator;
    },
    {
      recibidas: 0,
      contestadas: 0,
      abandonadas: 0,
      transaccionesCC: 0,
      ventasValidas: 0,
    }
  );

  return {
    recibidas: totals.recibidas,
    contestadas: totals.contestadas,
    abandonadas: totals.abandonadas,
    nivelDeServicio:
      totals.recibidas > 0 ? (totals.contestadas / totals.recibidas) * 100 : 0,
    conversion:
      totals.contestadas > 0
        ? (totals.transaccionesCC / totals.contestadas) * 100
        : 0,
    transaccionesCC: totals.transaccionesCC,
    ventasValidas: totals.ventasValidas,
    ticketPromedio:
      totals.transaccionesCC > 0
        ? totals.ventasValidas / totals.transaccionesCC
        : 0,
  };
}

function sumShiftKpis(
  snapshots: DailySnapshot[],
  shift: 'Día' | 'Noche'
): ShiftKPIs {
  const totals = snapshots.reduce(
    (accumulator, snapshot) => {
      const current = snapshot.shiftKpis[shift];
      accumulator.recibidas += current.recibidas;
      accumulator.contestadas += current.contestadas;
      accumulator.trans += current.trans;
      accumulator.abandonadas += current.abandonadas;
      accumulator.duplicadas += current.duplicadas;
      accumulator.lt20 += current.lt20;
      return accumulator;
    },
    {
      recibidas: 0,
      contestadas: 0,
      trans: 0,
      abandonadas: 0,
      duplicadas: 0,
      lt20: 0,
    }
  );

  return {
    recibidas: totals.recibidas,
    contestadas: totals.contestadas,
    trans: totals.trans,
    conv: totals.contestadas > 0 ? (totals.trans / totals.contestadas) * 100 : 0,
    abandonadas: totals.abandonadas,
    duplicadas: totals.duplicadas,
    lt20: totals.lt20,
    atencion:
      totals.recibidas > 0 ? (totals.contestadas / totals.recibidas) * 100 : 0,
    abandonoPct:
      totals.recibidas > 0 ? (totals.abandonadas / totals.recibidas) * 100 : 0,
  };
}

function mergeTimeSlots(series: TimeSlotKpi[][]): TimeSlotKpi[] {
  if (series.length === 0) {
    return [];
  }

  return series[0].map((slot, index) => {
    const merged = series.reduce(
      (accumulator, currentSeries) => {
        const currentSlot = currentSeries[index];

        accumulator.recibidas += currentSlot?.recibidas ?? 0;
        accumulator.contestadas += currentSlot?.contestadas ?? 0;
        accumulator.transacciones += currentSlot?.transacciones ?? 0;
        accumulator.conexionSum += currentSlot?.conexionSum ?? 0;
        accumulator.abandonadas += currentSlot?.abandonadas ?? 0;
        accumulator.abandConnSum += currentSlot?.abandConnSum ?? 0;

        return accumulator;
      },
      {
        recibidas: 0,
        contestadas: 0,
        transacciones: 0,
        conexionSum: 0,
        abandonadas: 0,
        abandConnSum: 0,
      }
    );

    return {
      hora: slot.hora,
      recibidas: merged.recibidas,
      contestadas: merged.contestadas,
      transacciones: merged.transacciones,
      conexionSum: merged.conexionSum,
      conexionAvg:
        merged.contestadas > 0 ? merged.conexionSum / merged.contestadas : 0,
      pctAtencion:
        merged.recibidas > 0 ? (merged.contestadas / merged.recibidas) * 100 : 0,
      abandonadas: merged.abandonadas,
      abandConnSum: merged.abandConnSum,
      abandAvg:
        merged.abandonadas > 0 ? merged.abandConnSum / merged.abandonadas : 0,
      pctAband:
        merged.recibidas > 0 ? (merged.abandonadas / merged.recibidas) * 100 : 0,
      conversionRate:
        merged.contestadas > 0
          ? (merged.transacciones / merged.contestadas) * 100
          : 0,
    };
  });
}

function buildMonthlySnapshot(
  dailyHistory: Record<string, DailySnapshot>,
  monthKey: string
): MonthlyOperationalSnapshot | null {
  const { monthLabel, startDate, endDate, expectedDays } = buildMonthBounds(
    `${monthKey}-01`
  );
  const loadedDates = Object.keys(dailyHistory)
    .filter((date) => date.startsWith(`${monthKey}-`))
    .sort();

  if (loadedDates.length === 0) {
    return null;
  }

  const snapshots = loadedDates
    .map((date) => dailyHistory[date])
    .filter((snapshot): snapshot is DailySnapshot => Boolean(snapshot));

  return {
    monthKey,
    monthLabel,
    startDate,
    endDate,
    loadedDays: loadedDates.length,
    expectedDays,
    loadedDates,
    kpis: sumMonthlyKpis(snapshots),
    shiftKpis: {
      Día: sumShiftKpis(snapshots, 'Día'),
      Noche: sumShiftKpis(snapshots, 'Noche'),
    },
    operationalDetail: {
      day: mergeTimeSlots(snapshots.map((snapshot) => snapshot.operationalDetail.day)),
      night: mergeTimeSlots(
        snapshots.map((snapshot) => snapshot.operationalDetail.night)
      ),
    },
  };
}

export function buildMonthlyOperationalHistory(
  dailyHistory: Record<string, DailySnapshot>
): Record<string, MonthlyOperationalSnapshot> {
  const monthKeys = [...new Set(Object.keys(dailyHistory).map((date) => date.slice(0, 7)))].sort();

  return monthKeys.reduce<Record<string, MonthlyOperationalSnapshot>>((accumulator, monthKey) => {
    const snapshot = buildMonthlySnapshot(dailyHistory, monthKey);

    if (snapshot) {
      accumulator[monthKey] = snapshot;
    }

    return accumulator;
  }, {});
}

export function buildMonthlyOperationalReport(
  dailyHistory: Record<string, DailySnapshot>,
  referenceDate: string | null
): MonthlyOperationalSnapshot | null {
  if (!referenceDate) {
    return null;
  }

  return buildMonthlySnapshot(dailyHistory, referenceDate.slice(0, 7));
}

export function getPreviousMonthlyOperationalReport(
  dailyHistory: Record<string, DailySnapshot>,
  referenceDate: string | null
): MonthlyOperationalSnapshot | null {
  return getPreviousMonthlyOperationalSnapshot(
    buildMonthlyOperationalHistory(dailyHistory),
    referenceDate
  );
}

export function getPreviousMonthlyOperationalSnapshot(
  monthlyHistory: Record<string, MonthlyOperationalSnapshot>,
  referenceDate: string | null
): MonthlyOperationalSnapshot | null {
  if (!referenceDate) {
    return null;
  }

  const monthKeys = Object.keys(monthlyHistory).sort();
  const currentMonthKey = referenceDate.slice(0, 7);
  const currentIndex = monthKeys.indexOf(currentMonthKey);

  if (currentIndex <= 0) {
    return null;
  }

  return monthlyHistory[monthKeys[currentIndex - 1]] ?? null;
}
