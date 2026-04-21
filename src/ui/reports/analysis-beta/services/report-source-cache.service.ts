import { del, get, set } from 'idb-keyval';
import type {
  AbandonedCall,
  AnsweredCall,
  Transaction,
} from '@/ui/reports/analysis-beta/types/dashboard.types';

const SOURCE_CACHE_INDEX_KEY = 'call-center-source-cache:index';
const SOURCE_CACHE_KEY_PREFIX = 'call-center-source-cache:date:';

export type CachedDailySourceData = {
  date: string;
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
  updatedAt: string;
};

type SourcePatch =
  | { source: 'answered'; records: AnsweredCall[] }
  | { source: 'abandoned'; records: AbandonedCall[] }
  | { source: 'transactions'; records: Transaction[] };

function sourceCacheKey(date: string): string {
  return `${SOURCE_CACHE_KEY_PREFIX}${date}`;
}

function emptyDailySource(date: string): CachedDailySourceData {
  return {
    date,
    answeredCalls: [],
    rawAbandonedCalls: [],
    rawTransactions: [],
    updatedAt: new Date().toISOString(),
  };
}

function canUseIndexedDb(): boolean {
  return typeof window !== 'undefined';
}

function groupRecordsByDate<T extends { fecha: string }>(
  records: T[]
): Map<string, T[]> {
  return records.reduce<Map<string, T[]>>((groups, record) => {
    const current = groups.get(record.fecha) ?? [];

    current.push(record);
    groups.set(record.fecha, current);
    return groups;
  }, new Map());
}

async function readSourceIndex(): Promise<string[]> {
  if (!canUseIndexedDb()) {
    return [];
  }

  const index = await get(SOURCE_CACHE_INDEX_KEY);

  return Array.isArray(index)
    ? index.map(String).filter(Boolean).sort()
    : [];
}

async function writeSourceIndex(dates: string[]): Promise<void> {
  if (!canUseIndexedDb()) {
    return;
  }

  await set(SOURCE_CACHE_INDEX_KEY, [...new Set(dates)].sort());
}

export async function loadCachedDailySource(
  date: string
): Promise<CachedDailySourceData> {
  if (!canUseIndexedDb()) {
    return emptyDailySource(date);
  }

  const cached = await get(sourceCacheKey(date));

  if (!cached || typeof cached !== 'object') {
    return emptyDailySource(date);
  }

  const source = cached as Partial<CachedDailySourceData>;

  return {
    date,
    answeredCalls: source.answeredCalls ?? [],
    rawAbandonedCalls: source.rawAbandonedCalls ?? [],
    rawTransactions: source.rawTransactions ?? [],
    updatedAt: source.updatedAt ?? new Date().toISOString(),
  };
}

export async function loadCachedDailySources(
  dates: string[]
): Promise<CachedDailySourceData[]> {
  const uniqueDates = [...new Set(dates)].filter(Boolean).sort();

  return Promise.all(uniqueDates.map((date) => loadCachedDailySource(date)));
}

export async function loadCachedSourcesForMonth(
  monthKey: string | null,
  knownDates: string[] = []
): Promise<CachedDailySourceData[]> {
  if (!monthKey) {
    return [];
  }

  const index = await readSourceIndex();
  const candidateDates = index.length > 0 ? index : knownDates;
  const monthDates = candidateDates
    .filter((date) => date.startsWith(`${monthKey}-`))
    .sort();

  return loadCachedDailySources(monthDates);
}

export function flattenCachedDailySources(sources: CachedDailySourceData[]): {
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
} {
  return sources.reduce(
    (accumulator, source) => {
      accumulator.answeredCalls.push(...source.answeredCalls);
      accumulator.rawAbandonedCalls.push(...source.rawAbandonedCalls);
      accumulator.rawTransactions.push(...source.rawTransactions);
      return accumulator;
    },
    {
      answeredCalls: [] as AnsweredCall[],
      rawAbandonedCalls: [] as AbandonedCall[],
      rawTransactions: [] as Transaction[],
    }
  );
}

export async function patchCachedDailySources(params: {
  dates: string[];
  patch: SourcePatch;
}): Promise<CachedDailySourceData[]> {
  const dates = [...new Set(params.dates)].filter(Boolean).sort();

  if (!canUseIndexedDb() || dates.length === 0) {
    return [];
  }

  const answeredByDate =
    params.patch.source === 'answered'
      ? groupRecordsByDate(params.patch.records)
      : null;
  const abandonedByDate =
    params.patch.source === 'abandoned'
      ? groupRecordsByDate(params.patch.records)
      : null;
  const transactionsByDate =
    params.patch.source === 'transactions'
      ? groupRecordsByDate(params.patch.records)
      : null;
  const updatedAt = new Date().toISOString();
  const updatedSources = await Promise.all(
    dates.map(async (date) => {
      const current = await loadCachedDailySource(date);
      const next: CachedDailySourceData = {
        ...current,
        updatedAt,
      };

      if (params.patch.source === 'answered') {
        next.answeredCalls = answeredByDate?.get(date) ?? [];
      }

      if (params.patch.source === 'abandoned') {
        next.rawAbandonedCalls = abandonedByDate?.get(date) ?? [];
      }

      if (params.patch.source === 'transactions') {
        next.rawTransactions = transactionsByDate?.get(date) ?? [];
      }

      await set(sourceCacheKey(date), next);
      return next;
    })
  );
  const currentIndex = await readSourceIndex();

  await writeSourceIndex([...currentIndex, ...dates]);
  return updatedSources;
}

export async function seedCachedDailySources(params: {
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
}): Promise<CachedDailySourceData[]> {
  const answeredByDate = groupRecordsByDate(params.answeredCalls);
  const abandonedByDate = groupRecordsByDate(params.rawAbandonedCalls);
  const transactionsByDate = groupRecordsByDate(params.rawTransactions);
  const dates = [
    ...new Set([
      ...answeredByDate.keys(),
      ...abandonedByDate.keys(),
      ...transactionsByDate.keys(),
    ]),
  ].sort();

  if (!canUseIndexedDb() || dates.length === 0) {
    return [];
  }

  const updatedAt = new Date().toISOString();
  const sources = dates.map((date) => ({
    date,
    answeredCalls: answeredByDate.get(date) ?? [],
    rawAbandonedCalls: abandonedByDate.get(date) ?? [],
    rawTransactions: transactionsByDate.get(date) ?? [],
    updatedAt,
  }));

  await Promise.all(
    sources.map((source) => set(sourceCacheKey(source.date), source))
  );
  await writeSourceIndex([...new Set([...(await readSourceIndex()), ...dates])]);
  return sources;
}

export async function deleteCachedDailySource(date: string): Promise<void> {
  if (!canUseIndexedDb()) {
    return;
  }

  await del(sourceCacheKey(date));
  const nextIndex = (await readSourceIndex()).filter((item) => item !== date);
  await writeSourceIndex(nextIndex);
}

export async function clearCachedDailySources(): Promise<void> {
  if (!canUseIndexedDb()) {
    return;
  }

  const dates = await readSourceIndex();

  await Promise.all(dates.map((date) => del(sourceCacheKey(date))));
  await del(SOURCE_CACHE_INDEX_KEY);
}
