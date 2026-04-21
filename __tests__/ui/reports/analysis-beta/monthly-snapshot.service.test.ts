import {
  buildMonthlyOperationalHistoryFromReportSnapshots,
  buildMonthlyReportSnapshot,
  mergeMonthlyReportSnapshots,
} from '@/ui/reports/analysis-beta/services/monthly-snapshot.service';
import type {
  DailySnapshot,
  SourceManifestEntry,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import type { CachedDailySourceData } from '@/ui/reports/analysis-beta/services/report-source-cache.service';

function createSnapshot(
  date: string,
  values: {
    recibidas: number;
    contestadas: number;
    abandonadas: number;
    transaccionesCC: number;
    ventasValidas: number;
  }
): DailySnapshot {
  return {
    date,
    updatedAt: `${date}T22:00:00.000Z`,
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
          contestadas: values.contestadas,
          transacciones: values.transaccionesCC,
          conexionSum: values.contestadas * 20,
          conexionAvg: values.contestadas > 0 ? 20 : 0,
          pctAtencion:
            values.recibidas > 0 ? (values.contestadas / values.recibidas) * 100 : 0,
          abandonadas: values.abandonadas,
          abandConnSum: values.abandonadas * 10,
          abandAvg: values.abandonadas > 0 ? 10 : 0,
          pctAband:
            values.recibidas > 0 ? (values.abandonadas / values.recibidas) * 100 : 0,
          conversionRate:
            values.contestadas > 0
              ? (values.transaccionesCC / values.contestadas) * 100
              : 0,
        },
      ],
      night: [],
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

const dailyHistory = {
  '2026-03-01': createSnapshot('2026-03-01', {
    recibidas: 10,
    contestadas: 8,
    abandonadas: 2,
    transaccionesCC: 2,
    ventasValidas: 2500,
  }),
  '2026-03-02': createSnapshot('2026-03-02', {
    recibidas: 12,
    contestadas: 9,
    abandonadas: 3,
    transaccionesCC: 3,
    ventasValidas: 3900,
  }),
} satisfies Record<string, DailySnapshot>;

const sources: CachedDailySourceData[] = [
  {
    date: '2026-03-01',
    answeredCalls: [],
    rawAbandonedCalls: [],
    rawTransactions: [
      {
        id: 'trx-1',
        sucursal: 'Unicentro',
        agente: 'wanda sanchez',
        agenteTipo: 'agente',
        canalReal: 'CC',
        plataforma: 'Call center',
        plataformaCode: 'CC',
        fecha: '2026-03-01',
        hora: '09:10:00',
        estatus: 'N',
        valor: 1200,
      },
      {
        id: 'trx-2',
        sucursal: 'Unicentro',
        agente: 'App',
        agenteTipo: 'plataforma',
        agenteCodigo: 'APP',
        canalReal: 'APP',
        plataforma: 'App',
        plataformaCode: 'APP',
        fecha: '2026-03-01',
        hora: '10:20:00',
        estatus: 'N',
        valor: 800,
      },
    ],
    updatedAt: '2026-03-01T23:00:00.000Z',
  },
  {
    date: '2026-03-02',
    answeredCalls: [],
    rawAbandonedCalls: [],
    rawTransactions: [
      {
        id: 'trx-3',
        sucursal: 'Bella Vista',
        agente: 'wanda sanchez',
        agenteTipo: 'agente',
        canalReal: 'CC',
        plataforma: 'Call center',
        plataformaCode: 'CC',
        fecha: '2026-03-02',
        hora: '11:10:00',
        estatus: 'N',
        valor: 1500,
      },
    ],
    updatedAt: '2026-03-02T23:00:00.000Z',
  },
];

const sourceManifest: SourceManifestEntry[] = [
  {
    source: 'transactions',
    fileName: 'EXPORT_TRS_MARZO.XLS',
    rows: 3,
    dateStart: '2026-03-01',
    dateEnd: '2026-03-31',
    importedAt: '2026-04-21T12:00:00.000Z',
    saturatedLegacyXls: false,
  },
];

describe('monthly-snapshot.service', () => {
  it('builds a compact monthly snapshot with operational and commercial aggregates', () => {
    const snapshot = buildMonthlyReportSnapshot({
      monthKey: '2026-03',
      dailyHistory,
      sources,
      sourceManifest,
    });

    expect(snapshot).toEqual(
      expect.objectContaining({
        monthKey: '2026-03',
        monthLabel: 'marzo de 2026',
        loadedDays: 2,
        expectedDays: 31,
        snapshotVersion: 1,
        coverage: expect.objectContaining({ loadedSources: 3, isComplete: true }),
      })
    );
    expect(snapshot?.dailyCumulative).toEqual([
      expect.objectContaining({
        date: '2026-03-01',
        contestadas: 8,
        transaccionesCC: 2,
        ventasValidas: 2500,
      }),
      expect.objectContaining({
        date: '2026-03-02',
        contestadas: 17,
        transaccionesCC: 5,
        ventasValidas: 6400,
      }),
    ]);
    expect(snapshot?.representatives[0]).toEqual(
      expect.objectContaining({
        agente: 'wanda sanchez',
        transacciones: 2,
      })
    );
    expect(snapshot?.platforms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ plataforma: 'Call center', transacciones: 2 }),
        expect.objectContaining({ plataforma: 'App', transacciones: 1 }),
      ])
    );
    expect(snapshot?.branches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sucursal: 'Unicentro', transacciones: 1 }),
        expect.objectContaining({ sucursal: 'Bella Vista', transacciones: 1 }),
      ])
    );
    expect(snapshot?.sourceManifest).toHaveLength(1);
    expect(snapshot?.sourceHash).toEqual(expect.any(String));
  });

  it('projects synced monthly snapshots back into operational history', () => {
    const snapshot = buildMonthlyReportSnapshot({
      monthKey: '2026-03',
      dailyHistory,
      sources,
      sourceManifest,
    });

    expect(
      buildMonthlyOperationalHistoryFromReportSnapshots({
        '2026-03': snapshot!,
      })['2026-03']
    ).toEqual(
      expect.objectContaining({
        monthKey: '2026-03',
        kpis: expect.objectContaining({ contestadas: 17 }),
      })
    );
  });

  it('keeps the newest monthly snapshot during local and remote merges', () => {
    const older = buildMonthlyReportSnapshot({
      monthKey: '2026-03',
      dailyHistory,
      sources,
      sourceManifest,
    })!;
    const newer = {
      ...older,
      updatedAt: '2026-04-22T12:00:00.000Z',
      sourceHash: 'newer',
    };

    expect(
      mergeMonthlyReportSnapshots({
        local: { '2026-03': older },
        remote: { '2026-03': newer },
      })['2026-03'].sourceHash
    ).toBe('newer');
  });
});
