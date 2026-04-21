import {
  buildComparisonPeriodSummary,
  buildComparisonResult,
  buildComparisonSelectionOptions,
  resolveComparisonSelectionValue,
} from '@/ui/reports/analysis-beta/services/comparison.service';
import type { DailySnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

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
    updatedAt: '2026-04-17T12:00:00.000Z',
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

describe('comparison.service', () => {
  it('builds weekly summaries anchored to the selected date even across years', () => {
    const summary = buildComparisonPeriodSummary({
      anchorDate: '2025-01-01',
      periodMode: 'week',
      loadedDates: ['2024-12-30', '2024-12-31', '2025-01-01', '2025-01-03'],
    });

    expect(summary).toEqual(
      expect.objectContaining({
        start: '2024-12-30',
        end: '2025-01-05',
        loadedDays: 4,
        expectedDays: 7,
        isComplete: false,
      })
    );
  });

  it('compares full months from different years and exposes loaded-day coverage', () => {
    const result = buildComparisonResult({
      config: {
        baseDate: '2025-03-12',
        targetDate: '2026-03-18',
        periodMode: 'month',
        shift: 'Día',
        startTime: '09:00',
        endTime: '23:30',
      },
      allAnswered: [
        {
          id: 'a-1',
          dst: '8090000001',
          agente: 'rafael',
          fecha: '2025-03-01',
          periodo: '09:00-09:29',
          hora: '09:10',
          llamadas: 5,
          conexion: 80,
          turno: 'Día',
        },
        {
          id: 'a-2',
          dst: '8090000002',
          agente: 'rafael',
          fecha: '2025-03-02',
          periodo: '09:00-09:29',
          hora: '09:20',
          llamadas: 4,
          conexion: 70,
          turno: 'Día',
        },
        {
          id: 'a-3',
          dst: '8090000003',
          agente: 'nicole',
          fecha: '2026-03-01',
          periodo: '09:00-09:29',
          hora: '09:15',
          llamadas: 6,
          conexion: 90,
          turno: 'Día',
        },
        {
          id: 'a-4',
          dst: '8090000004',
          agente: 'nicole',
          fecha: '2026-03-02',
          periodo: '09:00-09:29',
          hora: '09:25',
          llamadas: 7,
          conexion: 95,
          turno: 'Día',
        },
      ],
      allAbandoned: [],
      allTransactions: [
        {
          id: 't-1',
          sucursal: 'Unicentro',
          agente: 'rafael',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Call center',
          plataformaCode: 'CC',
          fecha: '2025-03-01',
          hora: '09:12',
          estatus: 'N',
          valor: 900,
        },
        {
          id: 't-2',
          sucursal: 'Unicentro',
          agente: 'nicole',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Call center',
          plataformaCode: 'CC',
          fecha: '2026-03-01',
          hora: '09:18',
          estatus: 'N',
          valor: 1200,
        },
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.basePeriod).toEqual(
      expect.objectContaining({
        label: 'marzo de 2025',
        start: '2025-03-01',
        end: '2025-03-31',
        loadedDays: 2,
        expectedDays: 31,
        isComplete: false,
      })
    );
    expect(result?.targetPeriod).toEqual(
      expect.objectContaining({
        label: 'marzo de 2026',
        start: '2026-03-01',
        end: '2026-03-31',
        loadedDays: 2,
        expectedDays: 31,
        isComplete: false,
      })
    );
  });

  it('builds explicit monthly options from loaded dates and resolves selections inside the same month', () => {
    const options = buildComparisonSelectionOptions({
      availableDates: [
        '2025-03-01',
        '2025-03-02',
        '2025-04-01',
        '2026-03-01',
      ],
      periodMode: 'month',
    });

    expect(options.map((option) => option.label)).toEqual([
      'marzo de 2026 · 1/31 dias',
      'abril de 2025 · 1/30 dias',
      'marzo de 2025 · 2/31 dias',
    ]);
    expect(
      resolveComparisonSelectionValue({
        selectedDate: '2025-03-02',
        options,
        periodMode: 'month',
      })
    ).toBe('2025-03-01');
  });

  it('builds explicit quarterly options from loaded dates and resolves selections inside the same quarter', () => {
    const options = buildComparisonSelectionOptions({
      availableDates: [
        '2025-01-10',
        '2025-02-14',
        '2025-04-01',
        '2026-03-20',
      ],
      periodMode: 'quarter',
    });

    expect(options.map((option) => option.label)).toEqual([
      'T1 2026 · 1/90 dias',
      'T2 2025 · 1/91 dias',
      'T1 2025 · 2/90 dias',
    ]);
    expect(
      resolveComparisonSelectionValue({
        selectedDate: '2025-02-14',
        options,
        periodMode: 'quarter',
      })
    ).toBe('2025-01-10');
  });

  it('falls back to snapshot history for quarterly comparisons when raw rows are unavailable', () => {
    const result = buildComparisonResult({
      config: {
        baseDate: '2026-01-31',
        targetDate: '2026-04-15',
        periodMode: 'quarter',
        shift: 'Día',
        startTime: '09:00',
        endTime: '23:30',
      },
      allAnswered: [],
      allAbandoned: [],
      allTransactions: [],
      dailyHistory: {
        '2026-01-31': createSnapshot('2026-01-31', {
          recibidas: 10,
          contestadas: 8,
          abandonadas: 2,
          transaccionesCC: 2,
          ventasValidas: 1800,
        }),
        '2026-02-15': createSnapshot('2026-02-15', {
          recibidas: 12,
          contestadas: 9,
          abandonadas: 3,
          transaccionesCC: 3,
          ventasValidas: 2400,
        }),
        '2026-04-10': createSnapshot('2026-04-10', {
          recibidas: 14,
          contestadas: 11,
          abandonadas: 3,
          transaccionesCC: 4,
          ventasValidas: 3600,
        }),
        '2026-05-02': createSnapshot('2026-05-02', {
          recibidas: 9,
          contestadas: 7,
          abandonadas: 2,
          transaccionesCC: 2,
          ventasValidas: 2100,
        }),
      },
    });

    expect(result).not.toBeNull();
    expect(result?.basePeriod).toEqual(
      expect.objectContaining({
        label: 'T1 2026',
        start: '2026-01-01',
        end: '2026-03-31',
        loadedDays: 2,
      })
    );
    expect(result?.targetPeriod).toEqual(
      expect.objectContaining({
        label: 'T2 2026',
        start: '2026-04-01',
        end: '2026-06-30',
        loadedDays: 2,
      })
    );
    expect(result?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Recibidas',
          baseValue: 22,
          targetValue: 23,
        }),
        expect.objectContaining({
          label: 'Ventas válidas',
          baseValue: 4200,
          targetValue: 5700,
        }),
      ])
    );
  });

  it('falls back to snapshot history for monthly comparisons when raw rows are unavailable', () => {
    const result = buildComparisonResult({
      config: {
        baseDate: '2026-02-28',
        targetDate: '2026-03-15',
        periodMode: 'month',
        shift: 'Día',
        startTime: '09:00',
        endTime: '23:30',
      },
      allAnswered: [],
      allAbandoned: [],
      allTransactions: [],
      dailyHistory: {
        '2026-02-28': createSnapshot('2026-02-28', {
          recibidas: 10,
          contestadas: 8,
          abandonadas: 2,
          transaccionesCC: 2,
          ventasValidas: 2000,
        }),
        '2026-03-01': createSnapshot('2026-03-01', {
          recibidas: 12,
          contestadas: 9,
          abandonadas: 3,
          transaccionesCC: 3,
          ventasValidas: 3000,
        }),
        '2026-03-02': createSnapshot('2026-03-02', {
          recibidas: 8,
          contestadas: 7,
          abandonadas: 1,
          transaccionesCC: 2,
          ventasValidas: 2400,
        }),
      },
    });

    expect(result).not.toBeNull();
    expect(result?.basePeriod).toEqual(
      expect.objectContaining({
        start: '2026-02-01',
        end: '2026-02-28',
        loadedDays: 1,
      })
    );
    expect(result?.targetPeriod).toEqual(
      expect.objectContaining({
        start: '2026-03-01',
        end: '2026-03-31',
        loadedDays: 2,
      })
    );
    expect(result?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Recibidas',
          baseValue: 10,
          targetValue: 20,
        }),
        expect.objectContaining({
          label: 'Ventas válidas',
          baseValue: 2000,
          targetValue: 5400,
        }),
      ])
    );
    expect(result?.slotDeltas[0]).toEqual(
      expect.objectContaining({
        hora: '09:00',
        baseContestadas: 8,
        targetContestadas: 16,
      })
    );
  });
});
