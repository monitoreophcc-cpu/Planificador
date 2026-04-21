import { createClient } from '@/lib/supabase/client';
import type {
  MonthlyReportSnapshot,
  ReportMonthlySnapshotSyncRow,
} from '@/ui/reports/analysis-beta/types/dashboard.types';

const MONTHLY_SNAPSHOT_TABLE = 'call_center_monthly_snapshots';

type StoredMonthlySnapshotRow = ReportMonthlySnapshotSyncRow & {
  synced_at?: string | null;
};

function isMissingMonthlySnapshotTableError(error: unknown): boolean {
  if (!(error instanceof Error) && typeof error !== 'object') {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '');
  const code =
    error instanceof Error
      ? ''
      : String((error as { code?: unknown }).code ?? '');

  return (
    code === '42P01' ||
    message.toLowerCase().includes(MONTHLY_SNAPSHOT_TABLE)
  );
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject<T extends object>(value: unknown, fallback: T): T {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as T)
    : fallback;
}

export function buildMonthlySnapshotSyncRow(params: {
  userId: string;
  snapshot: MonthlyReportSnapshot;
}): ReportMonthlySnapshotSyncRow {
  const { userId, snapshot } = params;

  return {
    user_id: userId,
    month_key: snapshot.monthKey,
    month_label: snapshot.monthLabel,
    snapshot_version: snapshot.snapshotVersion,
    source_hash: snapshot.sourceHash,
    source_manifest: snapshot.sourceManifest,
    loaded_dates: snapshot.loadedDates,
    coverage: snapshot.coverage,
    kpis: snapshot.kpis,
    shift_kpis: snapshot.shiftKpis,
    operational_detail: snapshot.operationalDetail,
    daily_cumulative: snapshot.dailyCumulative,
    representatives: snapshot.representatives,
    platforms: snapshot.platforms,
    branches: snapshot.branches,
    updated_at: snapshot.updatedAt,
  };
}

export function buildMonthlySnapshotFromSyncRow(
  row: Record<string, unknown>
): MonthlyReportSnapshot {
  const stored = row as StoredMonthlySnapshotRow;
  const loadedDates = asArray<string>(stored.loaded_dates);
  const monthKey = String(stored.month_key);
  const [year, month] = monthKey.split('-').map(Number);
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return {
    monthKey,
    monthLabel: String(stored.month_label ?? monthKey),
    startDate: `${monthKey}-01`,
    endDate,
    loadedDays: loadedDates.length,
    expectedDays: new Date(Date.UTC(year, month, 0)).getUTCDate(),
    loadedDates,
    kpis: asObject(stored.kpis, {
      recibidas: 0,
      contestadas: 0,
      abandonadas: 0,
      nivelDeServicio: 0,
      conversion: 0,
      transaccionesCC: 0,
      ventasValidas: 0,
      ticketPromedio: 0,
    }),
    shiftKpis: asObject(stored.shift_kpis, {
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
    }),
    operationalDetail: asObject(stored.operational_detail, {
      day: [],
      night: [],
    }),
    snapshotVersion: Number(stored.snapshot_version ?? 1),
    sourceHash: String(stored.source_hash ?? ''),
    sourceManifest: asArray(stored.source_manifest),
    coverage: asObject(stored.coverage, {
      answeredLoaded: false,
      abandonedLoaded: false,
      transactionsLoaded: false,
      loadedSources: 0,
      isComplete: false,
    }),
    dailyCumulative: asArray(stored.daily_cumulative),
    representatives: asArray(stored.representatives),
    platforms: asArray(stored.platforms),
    branches: asArray(stored.branches),
    updatedAt: String(stored.updated_at ?? new Date().toISOString()),
  };
}

export async function loadMonthlySnapshotsFromSupabase(
  userId: string
): Promise<Record<string, MonthlyReportSnapshot>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(MONTHLY_SNAPSHOT_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('month_key', { ascending: true });

  if (error) {
    if (isMissingMonthlySnapshotTableError(error)) {
      return {};
    }

    throw error;
  }

  return (data ?? []).reduce<Record<string, MonthlyReportSnapshot>>(
    (accumulator, row) => {
      const snapshot = buildMonthlySnapshotFromSyncRow(
        row as Record<string, unknown>
      );
      accumulator[snapshot.monthKey] = snapshot;
      return accumulator;
    },
    {}
  );
}

export async function syncMonthlySnapshotsToSupabase(params: {
  userId: string;
  monthlySnapshots: Record<string, MonthlyReportSnapshot>;
}): Promise<void> {
  const rows = Object.values(params.monthlySnapshots)
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .map((snapshot) =>
      buildMonthlySnapshotSyncRow({
        userId: params.userId,
        snapshot,
      })
    );

  if (rows.length === 0) {
    const supabase = createClient();
    const { error } = await supabase
      .from(MONTHLY_SNAPSHOT_TABLE)
      .delete()
      .eq('user_id', params.userId);

    if (error && !isMissingMonthlySnapshotTableError(error)) {
      throw error;
    }

    return;
  }

  const supabase = createClient();
  const remoteMonthsRes = await supabase
    .from(MONTHLY_SNAPSHOT_TABLE)
    .select('month_key')
    .eq('user_id', params.userId);

  if (remoteMonthsRes.error) {
    if (isMissingMonthlySnapshotTableError(remoteMonthsRes.error)) {
      return;
    }

    throw remoteMonthsRes.error;
  }

  const { error } = await supabase
    .from(MONTHLY_SNAPSHOT_TABLE)
    .upsert(rows, { onConflict: 'user_id,month_key' });

  if (error) {
    if (isMissingMonthlySnapshotTableError(error)) {
      return;
    }

    throw error;
  }

  const localMonthKeys = new Set(rows.map((row) => row.month_key));
  const monthsToDelete = (remoteMonthsRes.data ?? [])
    .map((row) => String(row.month_key))
    .filter((monthKey) => !localMonthKeys.has(monthKey));

  if (monthsToDelete.length === 0) {
    return;
  }

  const deleteRes = await supabase
    .from(MONTHLY_SNAPSHOT_TABLE)
    .delete()
    .eq('user_id', params.userId)
    .in('month_key', monthsToDelete);

  if (deleteRes.error && !isMissingMonthlySnapshotTableError(deleteRes.error)) {
    throw deleteRes.error;
  }
}
