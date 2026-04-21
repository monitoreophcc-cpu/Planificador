import { createClient } from '@/lib/supabase/client';
import type {
  AbandonedCall,
  AnsweredCall,
  Transaction,
} from '@/ui/reports/analysis-beta/types/dashboard.types';

const SOURCE_TABLE = 'call_center_daily_sources';

type DailySourceRow = {
  user_id: string;
  report_date: string;
  answered_calls: AnsweredCall[];
  raw_abandoned_calls: AbandonedCall[];
  raw_transactions: Transaction[];
  source_updated_at: string;
};

function groupByDate<T extends { fecha: string }>(records: T[]): Record<string, T[]> {
  return records.reduce<Record<string, T[]>>((accumulator, record) => {
    if (!accumulator[record.fecha]) {
      accumulator[record.fecha] = [];
    }

    accumulator[record.fecha].push(record);
    return accumulator;
  }, {});
}

function isMissingDailySourceTableError(error: unknown): boolean {
  if (!(error instanceof Error) && typeof error !== 'object') {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '');

  return message.toLowerCase().includes(SOURCE_TABLE);
}

export function buildDailySourceSyncRows(params: {
  userId: string;
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
}): DailySourceRow[] {
  const answeredByDate = groupByDate(params.answeredCalls);
  const abandonedByDate = groupByDate(params.rawAbandonedCalls);
  const transactionsByDate = groupByDate(params.rawTransactions);
  const dates = [
    ...new Set([
      ...Object.keys(answeredByDate),
      ...Object.keys(abandonedByDate),
      ...Object.keys(transactionsByDate),
    ]),
  ].sort();
  const sourceUpdatedAt = new Date().toISOString();

  return dates.map((date) => ({
    user_id: params.userId,
    report_date: date,
    answered_calls: answeredByDate[date] ?? [],
    raw_abandoned_calls: abandonedByDate[date] ?? [],
    raw_transactions: transactionsByDate[date] ?? [],
    source_updated_at: sourceUpdatedAt,
  }));
}

export async function loadReportSourceDataFromSupabase(userId: string): Promise<{
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(SOURCE_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('report_date', { ascending: true });

  if (error) {
    if (isMissingDailySourceTableError(error)) {
      return {
        answeredCalls: [],
        rawAbandonedCalls: [],
        rawTransactions: [],
      };
    }

    throw error;
  }

  return (data ?? []).reduce<{
    answeredCalls: AnsweredCall[];
    rawAbandonedCalls: AbandonedCall[];
    rawTransactions: Transaction[];
  }>(
    (accumulator, row) => {
      const sourceRow = row as unknown as DailySourceRow;

      accumulator.answeredCalls.push(...(sourceRow.answered_calls ?? []));
      accumulator.rawAbandonedCalls.push(...(sourceRow.raw_abandoned_calls ?? []));
      accumulator.rawTransactions.push(...(sourceRow.raw_transactions ?? []));

      return accumulator;
    },
    {
      answeredCalls: [],
      rawAbandonedCalls: [],
      rawTransactions: [],
    }
  );
}

export async function syncReportSourceDataToSupabase(params: {
  userId: string;
  answeredCalls: AnsweredCall[];
  rawAbandonedCalls: AbandonedCall[];
  rawTransactions: Transaction[];
}): Promise<void> {
  const supabase = createClient();
  const { error: remoteError } = await supabase
    .from(SOURCE_TABLE)
    .select('report_date')
    .eq('user_id', params.userId)
    .limit(1);

  if (remoteError) {
    if (isMissingDailySourceTableError(remoteError)) {
      return;
    }

    throw remoteError;
  }

  const rows = buildDailySourceSyncRows(params);

  if (rows.length === 0) {
    return;
  }

  const { error: upsertError } = await supabase
    .from(SOURCE_TABLE)
    .upsert(rows, { onConflict: 'user_id,report_date' });

  if (upsertError) {
    if (isMissingDailySourceTableError(upsertError)) {
      return;
    }

    throw upsertError;
  }
}
