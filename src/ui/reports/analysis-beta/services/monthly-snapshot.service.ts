import type {
  AgentKPIs,
  DailySnapshot,
  KPIs,
  MonthlyBranchSnapshotRow,
  MonthlyCumulativeRow,
  MonthlyOperationalSnapshot,
  MonthlyPlatformSnapshotRow,
  MonthlyReportSnapshot,
  SourceCoverage,
  SourceManifestEntry,
  Transaction,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import type { CachedDailySourceData } from '@/ui/reports/analysis-beta/services/report-source-cache.service';
import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import { buildMonthlyOperationalReport } from '@/ui/reports/analysis-beta/services/monthly-report.service';

const SNAPSHOT_VERSION = 1;

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function buildHash(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function mergeSourceCoverage(snapshots: DailySnapshot[]): SourceCoverage {
  const answeredLoaded = snapshots.some((snapshot) => snapshot.coverage.answeredLoaded);
  const abandonedLoaded = snapshots.some((snapshot) => snapshot.coverage.abandonedLoaded);
  const transactionsLoaded = snapshots.some(
    (snapshot) => snapshot.coverage.transactionsLoaded
  );
  const loadedSources = [
    answeredLoaded,
    abandonedLoaded,
    transactionsLoaded,
  ].filter(Boolean).length;

  return {
    answeredLoaded,
    abandonedLoaded,
    transactionsLoaded,
    loadedSources,
    isComplete:
      snapshots.length > 0 && snapshots.every((snapshot) => snapshot.coverage.isComplete),
  };
}

function buildDailyCumulative(
  snapshots: DailySnapshot[]
): MonthlyCumulativeRow[] {
  let recibidas = 0;
  let contestadas = 0;
  let abandonadas = 0;
  let transaccionesCC = 0;
  let ventasValidas = 0;

  return snapshots
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((snapshot) => {
      recibidas += snapshot.kpis.recibidas;
      contestadas += snapshot.kpis.contestadas;
      abandonadas += snapshot.kpis.abandonadas;
      transaccionesCC += snapshot.kpis.transaccionesCC;
      ventasValidas += snapshot.kpis.ventasValidas;

      return {
        date: snapshot.date,
        recibidas,
        contestadas,
        abandonadas,
        transaccionesCC,
        ventasValidas,
      };
    });
}

function flattenMonthTransactions(sources: CachedDailySourceData[]): Transaction[] {
  return sources.flatMap((source) => source.rawTransactions);
}

function buildPlatformRows(
  transactions: Transaction[]
): MonthlyPlatformSnapshotRow[] {
  const rows = new Map<
    string,
    {
      plataforma: string;
      plataformaCode?: string;
      transacciones: number;
      ventas: number;
    }
  >();

  transactions
    .filter((transaction) => transaction.estatus === 'N')
    .forEach((transaction) => {
      const plataforma = transaction.plataforma || 'Sin plataforma';
      const key = transaction.plataformaCode || plataforma.toLowerCase();
      const current = rows.get(key) ?? {
        plataforma,
        plataformaCode: transaction.plataformaCode || undefined,
        transacciones: 0,
        ventas: 0,
      };

      current.transacciones += 1;
      current.ventas += transaction.valor || 0;
      rows.set(key, current);
    });

  return [...rows.values()]
    .map((row) => ({
      ...row,
      ticketPromedio: row.transacciones > 0 ? row.ventas / row.transacciones : 0,
    }))
    .sort((left, right) =>
      right.transacciones === left.transacciones
        ? right.ventas - left.ventas
        : right.transacciones - left.transacciones
    );
}

function buildBranchRows(
  transactions: Transaction[]
): MonthlyBranchSnapshotRow[] {
  const rows = new Map<string, number>();

  transactions
    .filter(
      (transaction) =>
        transaction.estatus === 'N' && transaction.plataforma === 'Call center'
    )
    .forEach((transaction) => {
      const sucursal = transaction.sucursal || 'Sin sucursal';
      rows.set(sucursal, (rows.get(sucursal) ?? 0) + 1);
    });

  return [...rows.entries()]
    .map(([sucursal, transacciones]) => ({ sucursal, transacciones }))
    .sort((left, right) =>
      right.transacciones === left.transacciones
        ? left.sucursal.localeCompare(right.sucursal, 'es')
        : right.transacciones - left.transacciones
    );
}

function sourceManifestTouchesMonth(
  entry: SourceManifestEntry,
  monthKey: string
): boolean {
  if (!entry.dateStart || !entry.dateEnd) {
    return false;
  }

  const monthStart = `${monthKey}-01`;
  const [year, month] = monthKey.split('-').map(Number);
  const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return entry.dateStart <= monthEnd && entry.dateEnd >= monthStart;
}

function pickSourceManifestForMonth(
  sourceManifest: SourceManifestEntry[],
  monthKey: string
): SourceManifestEntry[] {
  return sourceManifest
    .filter((entry) => sourceManifestTouchesMonth(entry, monthKey))
    .sort((left, right) =>
      left.importedAt === right.importedAt
        ? left.fileName.localeCompare(right.fileName, 'es')
        : left.importedAt.localeCompare(right.importedAt)
    );
}

function latestUpdatedAt(values: string[]): string {
  return values.sort()[values.length - 1] ?? new Date().toISOString();
}

export function monthlyReportSnapshotToOperationalSnapshot(
  snapshot: MonthlyReportSnapshot
): MonthlyOperationalSnapshot {
  return {
    monthKey: snapshot.monthKey,
    monthLabel: snapshot.monthLabel,
    startDate: snapshot.startDate,
    endDate: snapshot.endDate,
    loadedDays: snapshot.loadedDays,
    expectedDays: snapshot.expectedDays,
    loadedDates: snapshot.loadedDates,
    kpis: snapshot.kpis,
    shiftKpis: snapshot.shiftKpis,
    operationalDetail: snapshot.operationalDetail,
  };
}

export function buildMonthlyOperationalHistoryFromReportSnapshots(
  snapshots: Record<string, MonthlyReportSnapshot>
): Record<string, MonthlyOperationalSnapshot> {
  return Object.values(snapshots).reduce<Record<string, MonthlyOperationalSnapshot>>(
    (accumulator, snapshot) => {
      accumulator[snapshot.monthKey] = monthlyReportSnapshotToOperationalSnapshot(snapshot);
      return accumulator;
    },
    {}
  );
}

export function buildMonthlyReportSnapshot(params: {
  monthKey: string;
  dailyHistory: Record<string, DailySnapshot>;
  sources: CachedDailySourceData[];
  sourceManifest: SourceManifestEntry[];
}): MonthlyReportSnapshot | null {
  const operationalSnapshot = buildMonthlyOperationalReport(
    params.dailyHistory,
    `${params.monthKey}-01`
  );

  if (!operationalSnapshot) {
    return null;
  }

  const dailySnapshots = operationalSnapshot.loadedDates
    .map((date) => params.dailyHistory[date])
    .filter((snapshot): snapshot is DailySnapshot => Boolean(snapshot));
  const sourceManifest = pickSourceManifestForMonth(
    params.sourceManifest,
    params.monthKey
  );
  const transactions = flattenMonthTransactions(params.sources);
  const representatives: AgentKPIs[] = aggregateByAgent(transactions).filter(
    (row) => row.tipo === 'agente'
  );
  const platforms = buildPlatformRows(transactions);
  const branches = buildBranchRows(transactions);
  const coverage = mergeSourceCoverage(dailySnapshots);
  const dailyCumulative = buildDailyCumulative(dailySnapshots);
  const updatedAt = latestUpdatedAt([
    ...dailySnapshots.map((snapshot) => snapshot.updatedAt),
    ...params.sources.map((source) => source.updatedAt),
    ...sourceManifest.map((entry) => entry.importedAt),
  ]);
  const sourceHash = buildHash({
    monthKey: params.monthKey,
    loadedDates: operationalSnapshot.loadedDates,
    records: dailySnapshots.map((snapshot) => ({
      date: snapshot.date,
      records: snapshot.records,
      coverage: snapshot.coverage,
      updatedAt: snapshot.updatedAt,
    })),
    representatives,
    platforms,
    branches,
    sourceManifest,
  });

  return {
    ...operationalSnapshot,
    snapshotVersion: SNAPSHOT_VERSION,
    sourceHash,
    sourceManifest,
    coverage,
    dailyCumulative,
    representatives,
    platforms,
    branches,
    updatedAt,
  };
}

export function mergeMonthlyReportSnapshots(params: {
  local: Record<string, MonthlyReportSnapshot>;
  remote: Record<string, MonthlyReportSnapshot>;
}): Record<string, MonthlyReportSnapshot> {
  const monthKeys = [
    ...new Set([...Object.keys(params.remote), ...Object.keys(params.local)]),
  ].sort();

  return monthKeys.reduce<Record<string, MonthlyReportSnapshot>>(
    (accumulator, monthKey) => {
      const localSnapshot = params.local[monthKey];
      const remoteSnapshot = params.remote[monthKey];

      if (!localSnapshot) {
        accumulator[monthKey] = remoteSnapshot;
        return accumulator;
      }

      if (!remoteSnapshot) {
        accumulator[monthKey] = localSnapshot;
        return accumulator;
      }

      accumulator[monthKey] =
        remoteSnapshot.updatedAt > localSnapshot.updatedAt
          ? remoteSnapshot
          : localSnapshot;
      return accumulator;
    },
    {}
  );
}

export function getMonthlySnapshotKpiTotal(
  snapshots: Record<string, MonthlyReportSnapshot>,
  selector: (kpis: KPIs) => number
): number {
  return Object.values(snapshots).reduce(
    (total, snapshot) => total + selector(snapshot.kpis),
    0
  );
}
