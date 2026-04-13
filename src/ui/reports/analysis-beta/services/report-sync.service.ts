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
