import { createClient } from '@/lib/supabase/client';
import {
  buildDailyHistoryFromSyncRows,
  buildGlobalKpiSyncRow,
  buildOperationalDetailSyncRows,
  buildShiftKpiSyncRows,
} from '@/ui/reports/analysis-beta/services/report-sync.service';
import type { DailySnapshot } from '@/ui/reports/analysis-beta/types/dashboard.types';

const GLOBAL_TABLE = 'call_center_global_kpis';
const SHIFT_TABLE = 'call_center_shift_kpis';
const DETAIL_TABLE = 'call_center_operational_details';

function sortSnapshots(
  dailyHistory: Record<string, DailySnapshot>
): DailySnapshot[] {
  return Object.values(dailyHistory).sort((left, right) =>
    left.date.localeCompare(right.date)
  );
}

async function deleteHistoryDates(params: {
  userId: string;
  dates: string[];
}): Promise<void> {
  const { userId, dates } = params;

  if (dates.length === 0) {
    return;
  }

  const supabase = createClient();
  const [globalDelete, shiftDelete, detailDelete] = await Promise.all([
    supabase
      .from(GLOBAL_TABLE)
      .delete()
      .eq('user_id', userId)
      .in('report_date', dates),
    supabase
      .from(SHIFT_TABLE)
      .delete()
      .eq('user_id', userId)
      .in('report_date', dates),
    supabase
      .from(DETAIL_TABLE)
      .delete()
      .eq('user_id', userId)
      .in('report_date', dates),
  ]);

  const firstError =
    globalDelete.error ?? shiftDelete.error ?? detailDelete.error;

  if (firstError) {
    throw firstError;
  }
}

export async function loadReportHistoryFromSupabase(
  userId: string
): Promise<Record<string, DailySnapshot>> {
  const supabase = createClient();
  const [globalRes, shiftRes, detailRes] = await Promise.all([
    supabase
      .from(GLOBAL_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('report_date', { ascending: true }),
    supabase
      .from(SHIFT_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('report_date', { ascending: true })
      .order('shift', { ascending: true }),
    supabase
      .from(DETAIL_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('report_date', { ascending: true })
      .order('shift', { ascending: true })
      .order('slot_start', { ascending: true }),
  ]);

  const firstError = globalRes.error ?? shiftRes.error ?? detailRes.error;

  if (firstError) {
    throw firstError;
  }

  return buildDailyHistoryFromSyncRows({
    globalRows: (globalRes.data ?? []) as Array<Record<string, unknown>>,
    shiftRows: (shiftRes.data ?? []) as Array<Record<string, unknown>>,
    operationalRows: (detailRes.data ?? []) as Array<Record<string, unknown>>,
  });
}

export async function syncReportHistoryToSupabase(params: {
  userId: string;
  dailyHistory: Record<string, DailySnapshot>;
}): Promise<void> {
  const { userId, dailyHistory } = params;
  const supabase = createClient();
  const snapshots = sortSnapshots(dailyHistory);
  const localDates = snapshots.map((snapshot) => snapshot.date);

  if (snapshots.length === 0) {
    const [globalDelete, shiftDelete, detailDelete] = await Promise.all([
      supabase.from(GLOBAL_TABLE).delete().eq('user_id', userId),
      supabase.from(SHIFT_TABLE).delete().eq('user_id', userId),
      supabase.from(DETAIL_TABLE).delete().eq('user_id', userId),
    ]);

    const deleteError =
      globalDelete.error ?? shiftDelete.error ?? detailDelete.error;

    if (deleteError) {
      throw deleteError;
    }

    return;
  }

  const remoteDatesRes = await supabase
    .from(GLOBAL_TABLE)
    .select('report_date')
    .eq('user_id', userId);

  if (remoteDatesRes.error) {
    throw remoteDatesRes.error;
  }

  const remoteDates = new Set(
    (remoteDatesRes.data ?? []).map((row) => String(row.report_date))
  );
  const datesToDelete = [...remoteDates].filter((date) => !localDates.includes(date));

  const globalRows = snapshots.map((snapshot) =>
    buildGlobalKpiSyncRow(userId, snapshot)
  );
  const shiftRows = snapshots.flatMap((snapshot) =>
    buildShiftKpiSyncRows(userId, snapshot)
  );
  const operationalRows = snapshots.flatMap((snapshot) =>
    buildOperationalDetailSyncRows(userId, snapshot)
  );

  const [globalUpsert, shiftUpsert, detailUpsert] = await Promise.all([
    supabase
      .from(GLOBAL_TABLE)
      .upsert(globalRows, { onConflict: 'user_id,report_date' }),
    supabase
      .from(SHIFT_TABLE)
      .upsert(shiftRows, { onConflict: 'user_id,report_date,shift' }),
    supabase
      .from(DETAIL_TABLE)
      .upsert(operationalRows, {
        onConflict: 'user_id,report_date,shift,slot_start',
      }),
  ]);

  const upsertError =
    globalUpsert.error ?? shiftUpsert.error ?? detailUpsert.error;

  if (upsertError) {
    throw upsertError;
  }

  await deleteHistoryDates({ userId, dates: datesToDelete });
}
