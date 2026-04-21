import {
  buildMonthlySnapshotFromSyncRow,
  buildMonthlySnapshotSyncRow,
} from '@/ui/reports/analysis-beta/services/report-monthly-snapshot-cloud.service';
import type { MonthlyReportSnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

const snapshot: MonthlyReportSnapshot = {
  monthKey: '2026-03',
  monthLabel: 'marzo de 2026',
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  loadedDays: 2,
  expectedDays: 31,
  loadedDates: ['2026-03-01', '2026-03-02'],
  kpis: {
    recibidas: 22,
    contestadas: 17,
    abandonadas: 5,
    nivelDeServicio: 77.27,
    conversion: 29.41,
    transaccionesCC: 5,
    ventasValidas: 6400,
    ticketPromedio: 1280,
  },
  shiftKpis: {
    Día: {
      recibidas: 22,
      contestadas: 17,
      trans: 5,
      conv: 29.41,
      abandonadas: 5,
      duplicadas: 0,
      lt20: 0,
      atencion: 77.27,
      abandonoPct: 22.73,
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
    day: [],
    night: [],
  },
  snapshotVersion: 1,
  sourceHash: 'abc123',
  sourceManifest: [
    {
      source: 'transactions',
      fileName: 'EXPORT_TRS_MARZO.XLS',
      rows: 3,
      dateStart: '2026-03-01',
      dateEnd: '2026-03-31',
      importedAt: '2026-04-21T12:00:00.000Z',
      saturatedLegacyXls: false,
    },
  ],
  coverage: {
    answeredLoaded: true,
    abandonedLoaded: true,
    transactionsLoaded: true,
    loadedSources: 3,
    isComplete: true,
  },
  dailyCumulative: [
    {
      date: '2026-03-01',
      recibidas: 10,
      contestadas: 8,
      abandonadas: 2,
      transaccionesCC: 2,
      ventasValidas: 2500,
    },
  ],
  representatives: [
    {
      agente: 'wanda sanchez',
      tipo: 'agente',
      transacciones: 2,
      ventas: 2200,
      ticketPromedio: 1100,
    },
  ],
  platforms: [
    {
      plataforma: 'Call center',
      plataformaCode: 'CC',
      transacciones: 2,
      ventas: 2700,
      ticketPromedio: 1350,
    },
  ],
  branches: [
    {
      sucursal: 'Unicentro',
      transacciones: 1,
    },
  ],
  updatedAt: '2026-04-21T13:00:00.000Z',
};

describe('report-monthly-snapshot-cloud.service', () => {
  it('serializes monthly snapshots for Supabase upsert', () => {
    expect(
      buildMonthlySnapshotSyncRow({
        userId: 'user-1',
        snapshot,
      })
    ).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        month_key: '2026-03',
        source_hash: 'abc123',
        source_manifest: snapshot.sourceManifest,
        daily_cumulative: snapshot.dailyCumulative,
        representatives: snapshot.representatives,
        platforms: snapshot.platforms,
        branches: snapshot.branches,
      })
    );
  });

  it('hydrates a monthly snapshot from a synced Supabase row', () => {
    const row = buildMonthlySnapshotSyncRow({
      userId: 'user-1',
      snapshot,
    });

    expect(buildMonthlySnapshotFromSyncRow(row)).toEqual(
      expect.objectContaining({
        monthKey: '2026-03',
        endDate: '2026-03-31',
        loadedDays: 2,
        expectedDays: 31,
        representatives: snapshot.representatives,
      })
    );
  });
});
