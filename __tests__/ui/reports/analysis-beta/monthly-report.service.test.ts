import {
  buildMonthlyOperationalHistory,
  buildMonthlyOperationalReport,
  getPreviousMonthlyOperationalReport,
} from '@/ui/reports/analysis-beta/services/monthly-report.service';
import type { DailySnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

function createSnapshot(
  date: string,
  values: {
    recibidas: number;
    contestadas: number;
    abandonadas: number;
    transaccionesCC: number;
    ventasValidas: number;
    dayContestadas: number;
    dayTransacciones: number;
  }
): DailySnapshot {
  return {
    date,
    updatedAt: '2026-04-12T23:00:00.000Z',
    kpis: {
      recibidas: values.recibidas,
      contestadas: values.contestadas,
      abandonadas: values.abandonadas,
      nivelDeServicio:
        values.recibidas > 0 ? (values.contestadas / values.recibidas) * 100 : 0,
      conversion:
        values.contestadas > 0
          ? (values.transaccionesCC / values.contestadas) * 100
          : 0,
      transaccionesCC: values.transaccionesCC,
      ventasValidas: values.ventasValidas,
      ticketPromedio:
        values.transaccionesCC > 0
          ? values.ventasValidas / values.transaccionesCC
          : 0,
    },
    shiftKpis: {
      Día: {
        recibidas: values.recibidas,
        contestadas: values.contestadas,
        trans: values.transaccionesCC,
        conv:
          values.contestadas > 0
            ? (values.transaccionesCC / values.contestadas) * 100
            : 0,
        abandonadas: values.abandonadas,
        duplicadas: 0,
        lt20: 0,
        atencion:
          values.recibidas > 0 ? (values.contestadas / values.recibidas) * 100 : 0,
        abandonoPct:
          values.recibidas > 0 ? (values.abandonadas / values.recibidas) * 100 : 0,
      },
      Noche: {
        recibidas: 0,
        contestadas: 0,
        trans: 0,
        conv: 0,
        abandonadas: 0,
        duplicadas: 0,
        lt20: 0,
        atencion: 0,
        abandonoPct: 0,
      },
    },
    operationalDetail: {
      day: [
        {
          hora: '09:00',
          recibidas: values.recibidas,
          contestadas: values.dayContestadas,
          transacciones: values.dayTransacciones,
          conexionSum: values.dayContestadas * 20,
          conexionAvg: values.dayContestadas > 0 ? 20 : 0,
          pctAtencion:
            values.recibidas > 0 ? (values.dayContestadas / values.recibidas) * 100 : 0,
          abandonadas: values.recibidas - values.dayContestadas,
          abandConnSum: (values.recibidas - values.dayContestadas) * 10,
          abandAvg: values.recibidas - values.dayContestadas > 0 ? 10 : 0,
          pctAband:
            values.recibidas > 0
              ? ((values.recibidas - values.dayContestadas) / values.recibidas) * 100
              : 0,
          conversionRate:
            values.dayContestadas > 0
              ? (values.dayTransacciones / values.dayContestadas) * 100
              : 0,
        },
      ],
      night: [
        {
          hora: '16:00',
          recibidas: 0,
          contestadas: 0,
          transacciones: 0,
          conexionSum: 0,
          conexionAvg: 0,
          pctAtencion: 0,
          abandonadas: 0,
          abandConnSum: 0,
          abandAvg: 0,
          pctAband: 0,
          conversionRate: 0,
        },
      ],
    },
    records: {
      answeredCalls: values.contestadas,
      abandonedCalls: values.abandonadas,
      transactions: values.transaccionesCC,
    },
    coverage: {
      answeredLoaded: true,
      abandonedLoaded: true,
      transactionsLoaded: true,
      loadedSources: 3,
      isComplete: true,
    },
  };
}

describe('monthly-report.service', () => {
  const dailyHistory = {
    '2026-02-28': createSnapshot('2026-02-28', {
      recibidas: 8,
      contestadas: 6,
      abandonadas: 2,
      transaccionesCC: 2,
      ventasValidas: 1800,
      dayContestadas: 6,
      dayTransacciones: 2,
    }),
    '2026-03-01': createSnapshot('2026-03-01', {
      recibidas: 10,
      contestadas: 8,
      abandonadas: 2,
      transaccionesCC: 2,
      ventasValidas: 2200,
      dayContestadas: 8,
      dayTransacciones: 2,
    }),
    '2026-03-02': createSnapshot('2026-03-02', {
      recibidas: 12,
      contestadas: 9,
      abandonadas: 3,
      transaccionesCC: 3,
      ventasValidas: 3300,
      dayContestadas: 9,
      dayTransacciones: 3,
    }),
  } satisfies Record<string, DailySnapshot>;

  it('builds a monthly operational report from accumulated daily snapshots', () => {
    const report = buildMonthlyOperationalReport(dailyHistory, '2026-03-15');

    expect(report).toEqual(
      expect.objectContaining({
        monthKey: '2026-03',
        monthLabel: 'marzo de 2026',
        loadedDays: 2,
        expectedDays: 31,
      })
    );
    expect(report?.kpis).toEqual(
      expect.objectContaining({
        recibidas: 22,
        contestadas: 17,
        abandonadas: 5,
        transaccionesCC: 5,
        ventasValidas: 5500,
      })
    );
    expect(report?.kpis.nivelDeServicio).toBeCloseTo(77.2727, 3);
    expect(report?.kpis.conversion).toBeCloseTo(29.4117, 3);
    expect(report?.kpis.ticketPromedio).toBe(1100);
    expect(report?.operationalDetail.day[0]).toEqual(
      expect.objectContaining({
        hora: '09:00',
        recibidas: 22,
        contestadas: 17,
        transacciones: 5,
      })
    );
    expect(report?.operationalDetail.day[0].conversionRate).toBeCloseTo(29.4117, 3);
  });

  it('finds the previous available month for side-by-side monthly comparisons', () => {
    const previousReport = getPreviousMonthlyOperationalReport(
      dailyHistory,
      '2026-03-15'
    );

    expect(previousReport).toEqual(
      expect.objectContaining({
        monthKey: '2026-02',
        monthLabel: 'febrero de 2026',
        loadedDays: 1,
        expectedDays: 28,
      })
    );
    expect(previousReport?.kpis.recibidas).toBe(8);
  });

  it('materializes an explicit monthly history from daily snapshots', () => {
    const monthlyHistory = buildMonthlyOperationalHistory(dailyHistory);

    expect(Object.keys(monthlyHistory)).toEqual(['2026-02', '2026-03']);
    expect(monthlyHistory['2026-03']).toEqual(
      expect.objectContaining({
        monthKey: '2026-03',
        loadedDays: 2,
      })
    );
  });
});
