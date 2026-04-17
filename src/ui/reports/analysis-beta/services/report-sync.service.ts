import type {
  DailySnapshot,
  ReportGlobalKpiSyncRow,
  ReportOperationalDetailSyncRow,
  ReportShiftKpiSyncRow,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import { getAbandonmentRate } from '@/ui/reports/analysis-beta/services/executive.service';

function toTimeValue(slot: string) {
  return `${slot}:00`;
}

function toSyncShift(shift: 'Día' | 'Noche'): 'DAY' | 'NIGHT' {
  return shift === 'Día' ? 'DAY' : 'NIGHT';
}

function fromSyncShift(shift: string): 'Día' | 'Noche' {
  return shift === 'NIGHT' ? 'Noche' : 'Día';
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

type StoredGlobalKpiRow = ReportGlobalKpiSyncRow & {
  report_date: string;
  source_updated_at?: string | null;
};

type StoredShiftKpiRow = ReportShiftKpiSyncRow & {
  report_date: string;
};

type StoredOperationalDetailRow = ReportOperationalDetailSyncRow & {
  report_date: string;
};

export function buildGlobalKpiSyncRow(
  userId: string,
  snapshot: DailySnapshot
): ReportGlobalKpiSyncRow {
  return {
    user_id: userId,
    report_date: snapshot.date,
    recibidas: snapshot.kpis.recibidas,
    contestadas: snapshot.kpis.contestadas,
    abandonadas: snapshot.kpis.abandonadas,
    nivel_servicio: snapshot.kpis.nivelDeServicio,
    abandono_pct: getAbandonmentRate(snapshot.kpis),
    transacciones_cc: snapshot.kpis.transaccionesCC,
    conversion_pct: snapshot.kpis.conversion,
    ventas_validas: snapshot.kpis.ventasValidas,
    ticket_promedio: snapshot.kpis.ticketPromedio,
    answered_loaded: snapshot.coverage.answeredLoaded,
    abandoned_loaded: snapshot.coverage.abandonedLoaded,
    transactions_loaded: snapshot.coverage.transactionsLoaded,
    loaded_sources: snapshot.coverage.loadedSources,
    is_complete: snapshot.coverage.isComplete,
    source_updated_at: snapshot.updatedAt,
  };
}

export function buildShiftKpiSyncRows(
  userId: string,
  snapshot: DailySnapshot
): ReportShiftKpiSyncRow[] {
  return (['Día', 'Noche'] as const).map((shift) => ({
    user_id: userId,
    report_date: snapshot.date,
    shift: toSyncShift(shift),
    recibidas: snapshot.shiftKpis[shift].recibidas,
    contestadas: snapshot.shiftKpis[shift].contestadas,
    transacciones_cc: snapshot.shiftKpis[shift].trans,
    conversion_pct: snapshot.shiftKpis[shift].conv,
    abandonadas: snapshot.shiftKpis[shift].abandonadas,
    duplicadas: snapshot.shiftKpis[shift].duplicadas,
    lt20: snapshot.shiftKpis[shift].lt20,
    nivel_servicio: snapshot.shiftKpis[shift].atencion,
    abandono_pct: snapshot.shiftKpis[shift].abandonoPct,
  }));
}

function buildOperationalRowsForShift(params: {
  userId: string;
  reportDate: string;
  shift: 'Día' | 'Noche';
  slots: DailySnapshot['operationalDetail']['day'];
}): ReportOperationalDetailSyncRow[] {
  return params.slots.map((slot) => ({
    user_id: params.userId,
    report_date: params.reportDate,
    shift: toSyncShift(params.shift),
    slot_start: toTimeValue(slot.hora),
    recibidas: slot.recibidas,
    contestadas: slot.contestadas,
    transacciones_cc: slot.transacciones,
    conexion_sum: slot.conexionSum,
    conexion_avg: slot.conexionAvg,
    pct_atencion: slot.pctAtencion,
    abandonadas: slot.abandonadas,
    aband_conn_sum: slot.abandConnSum,
    aband_avg: slot.abandAvg,
    pct_abandono: slot.pctAband,
    conversion_pct: slot.conversionRate,
  }));
}

export function buildOperationalDetailSyncRows(
  userId: string,
  snapshot: DailySnapshot
): ReportOperationalDetailSyncRow[] {
  return [
    ...buildOperationalRowsForShift({
      userId,
      reportDate: snapshot.date,
      shift: 'Día',
      slots: snapshot.operationalDetail.day,
    }),
    ...buildOperationalRowsForShift({
      userId,
      reportDate: snapshot.date,
      shift: 'Noche',
      slots: snapshot.operationalDetail.night,
    }),
  ];
}

export function buildDailyHistoryFromSyncRows(params: {
  globalRows: Array<Record<string, unknown>>;
  shiftRows: Array<Record<string, unknown>>;
  operationalRows: Array<Record<string, unknown>>;
}): Record<string, DailySnapshot> {
  const globalRows = params.globalRows as StoredGlobalKpiRow[];
  const shiftRows = params.shiftRows as StoredShiftKpiRow[];
  const operationalRows = params.operationalRows as StoredOperationalDetailRow[];

  return globalRows.reduce<Record<string, DailySnapshot>>((accumulator, globalRow) => {
    const date = String(globalRow.report_date);
    const shiftRowsForDate = shiftRows.filter((row) => String(row.report_date) === date);
    const operationalRowsForDate = operationalRows.filter(
      (row) => String(row.report_date) === date
    );
    const shiftKpis = {
      Día: {
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
    } as DailySnapshot['shiftKpis'];

    shiftRowsForDate.forEach((row) => {
      const shift = fromSyncShift(String(row.shift));

      shiftKpis[shift] = {
        recibidas: toNumber(row.recibidas),
        contestadas: toNumber(row.contestadas),
        trans: toNumber(row.transacciones_cc),
        conv: toNumber(row.conversion_pct),
        abandonadas: toNumber(row.abandonadas),
        duplicadas: toNumber(row.duplicadas),
        lt20: toNumber(row.lt20),
        atencion: toNumber(row.nivel_servicio),
        abandonoPct: toNumber(row.abandono_pct),
      };
    });

    const operationalDetail = {
      day: operationalRowsForDate
        .filter((row) => String(row.shift) === 'DAY')
        .sort((left, right) => String(left.slot_start).localeCompare(String(right.slot_start)))
        .map((row) => ({
          hora: String(row.slot_start).slice(0, 5),
          recibidas: toNumber(row.recibidas),
          contestadas: toNumber(row.contestadas),
          transacciones: toNumber(row.transacciones_cc),
          conexionSum: toNumber(row.conexion_sum),
          conexionAvg: toNumber(row.conexion_avg),
          pctAtencion: toNumber(row.pct_atencion),
          abandonadas: toNumber(row.abandonadas),
          abandConnSum: toNumber(row.aband_conn_sum),
          abandAvg: toNumber(row.aband_avg),
          pctAband: toNumber(row.pct_abandono),
          conversionRate: toNumber(row.conversion_pct),
        })),
      night: operationalRowsForDate
        .filter((row) => String(row.shift) === 'NIGHT')
        .sort((left, right) => String(left.slot_start).localeCompare(String(right.slot_start)))
        .map((row) => ({
          hora: String(row.slot_start).slice(0, 5),
          recibidas: toNumber(row.recibidas),
          contestadas: toNumber(row.contestadas),
          transacciones: toNumber(row.transacciones_cc),
          conexionSum: toNumber(row.conexion_sum),
          conexionAvg: toNumber(row.conexion_avg),
          pctAtencion: toNumber(row.pct_atencion),
          abandonadas: toNumber(row.abandonadas),
          abandConnSum: toNumber(row.aband_conn_sum),
          abandAvg: toNumber(row.aband_avg),
          pctAband: toNumber(row.pct_abandono),
          conversionRate: toNumber(row.conversion_pct),
        })),
    };

    accumulator[date] = {
      date,
      updatedAt: globalRow.source_updated_at ?? new Date().toISOString(),
      kpis: {
        recibidas: toNumber(globalRow.recibidas),
        contestadas: toNumber(globalRow.contestadas),
        abandonadas: toNumber(globalRow.abandonadas),
        nivelDeServicio: toNumber(globalRow.nivel_servicio),
        conversion: toNumber(globalRow.conversion_pct),
        transaccionesCC: toNumber(globalRow.transacciones_cc),
        ventasValidas: toNumber(globalRow.ventas_validas),
        ticketPromedio: toNumber(globalRow.ticket_promedio),
      },
      shiftKpis,
      operationalDetail,
      records: {
        answeredCalls: toNumber(globalRow.contestadas),
        abandonedCalls: toNumber(globalRow.abandonadas),
        transactions: toNumber(globalRow.transacciones_cc),
      },
      coverage: {
        answeredLoaded: toBoolean(globalRow.answered_loaded),
        abandonedLoaded: toBoolean(globalRow.abandoned_loaded),
        transactionsLoaded: toBoolean(globalRow.transactions_loaded),
        loadedSources: toNumber(globalRow.loaded_sources),
        isComplete: toBoolean(globalRow.is_complete),
      },
    };

    return accumulator;
  }, {});
}
