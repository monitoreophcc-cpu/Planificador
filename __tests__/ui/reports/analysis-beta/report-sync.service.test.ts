import {
  buildGlobalKpiSyncRow,
  buildOperationalDetailSyncRows,
  buildShiftKpiSyncRows,
} from '@/ui/reports/analysis-beta/services/report-sync.service';
import type { DailySnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

const snapshot: DailySnapshot = {
  date: '2026-03-05',
  updatedAt: '2026-03-05T23:59:00.000Z',
  kpis: {
    recibidas: 20,
    contestadas: 16,
    abandonadas: 4,
    nivelDeServicio: 80,
    conversion: 25,
    transaccionesCC: 4,
    ventasValidas: 4800,
    ticketPromedio: 1200,
  },
  shiftKpis: {
    Día: {
      recibidas: 12,
      contestadas: 10,
      trans: 3,
      conv: 30,
      abandonadas: 2,
      duplicadas: 1,
      lt20: 0,
      atencion: 83.3333,
      abandonoPct: 16.6667,
    },
    Noche: {
      recibidas: 8,
      contestadas: 6,
      trans: 1,
      conv: 16.6667,
      abandonadas: 2,
      duplicadas: 0,
      lt20: 1,
      atencion: 75,
      abandonoPct: 25,
    },
  },
  operationalDetail: {
    day: [
      {
        hora: '09:00',
        recibidas: 5,
        contestadas: 4,
        transacciones: 1,
        conexionSum: 80,
        conexionAvg: 20,
        pctAtencion: 80,
        abandonadas: 1,
        abandConnSum: 15,
        abandAvg: 15,
        pctAband: 20,
        conversionRate: 25,
      },
    ],
    night: [
      {
        hora: '16:00',
        recibidas: 4,
        contestadas: 3,
        transacciones: 1,
        conexionSum: 60,
        conexionAvg: 20,
        pctAtencion: 75,
        abandonadas: 1,
        abandConnSum: 10,
        abandAvg: 10,
        pctAband: 25,
        conversionRate: 33.3333,
      },
    ],
  },
  records: {
    answeredCalls: 16,
    abandonedCalls: 4,
    transactions: 4,
  },
  coverage: {
    answeredLoaded: true,
    abandonedLoaded: true,
    transactionsLoaded: true,
    loadedSources: 3,
    isComplete: true,
  },
};

describe('report-sync.service', () => {
  it('builds the daily global KPI row expected by Supabase', () => {
    expect(buildGlobalKpiSyncRow('user-1', snapshot)).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        report_date: '2026-03-05',
        recibidas: 20,
        contestadas: 16,
        abandonadas: 4,
        abandono_pct: 20,
        transacciones_cc: 4,
        conversion_pct: 25,
        loaded_sources: 3,
        is_complete: true,
      })
    );
  });

  it('serializes per-shift KPI rows using ASCII shift keys for the database', () => {
    expect(buildShiftKpiSyncRows('user-1', snapshot)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shift: 'DAY',
          recibidas: 12,
          contestadas: 10,
          transacciones_cc: 3,
        }),
        expect.objectContaining({
          shift: 'NIGHT',
          recibidas: 8,
          contestadas: 6,
          transacciones_cc: 1,
        }),
      ])
    );
  });

  it('serializes operational detail rows ready for slot-level upserts', () => {
    expect(buildOperationalDetailSyncRows('user-1', snapshot)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shift: 'DAY',
          slot_start: '09:00:00',
          recibidas: 5,
          contestadas: 4,
          transacciones_cc: 1,
        }),
        expect.objectContaining({
          shift: 'NIGHT',
          slot_start: '16:00:00',
          recibidas: 4,
          contestadas: 3,
          transacciones_cc: 1,
        }),
      ])
    );
  });
});
