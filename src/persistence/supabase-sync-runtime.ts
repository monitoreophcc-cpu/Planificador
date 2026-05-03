import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createClient } from '@/lib/supabase/client'
import type {
  PendingQueueSummary,
  SyncResult,
  SyncRow,
  SyncTable,
} from './supabase-sync-types'

type PersistedSyncTable = SyncTable

type PendingOperation = {
  key: string
  userId: string
  table: PersistedSyncTable
  rows: SyncRow[]
}

interface SyncQueueDb extends DBSchema {
  pending_sync: {
    key: string
    value: PendingOperation
  }
}

const DB_NAME = 'cloud-sync-queue'
const DB_VERSION = 2
const SUPPORTED_SYNC_TABLES = [
  'representatives',
  'commercial_goals',
  'weekly_plans',
  'incidents',
  'swaps',
  'coverage_rules',
] as const satisfies readonly SyncTable[]
const OPTIONAL_SYNC_TABLES = ['commercial_goals'] as const satisfies readonly SyncTable[]

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unexpected_sync_error'
}

function isMissingTableError(table: SyncTable, error: unknown): boolean {
  if (!(error instanceof Error) && typeof error !== 'object') {
    return false
  }

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: unknown }).message ?? '')
  const code =
    error instanceof Error
      ? ''
      : String((error as { code?: unknown }).code ?? '')
  const normalizedMessage = message.toLowerCase()
  const normalizedTable = table.toLowerCase()

  return (
    code === '42P01' ||
    code === 'PGRST204' ||
    normalizedMessage.includes(normalizedTable) ||
    normalizedMessage.includes(`public.${normalizedTable}`)
  )
}

function isMissingOptionalSyncTableError(
  table: SyncTable,
  error: unknown
): boolean {
  return (
    (OPTIONAL_SYNC_TABLES as readonly SyncTable[]).includes(table) &&
    isMissingTableError(table, error)
  )
}

function isSupportedSyncTable(value: unknown): value is SyncTable {
  return SUPPORTED_SYNC_TABLES.includes(value as SyncTable)
}

function queueKey(userId: string, table: PersistedSyncTable): string {
  return `${userId}:${table}`
}

async function pruneUnsupportedPendingOperations(
  db: IDBPDatabase<SyncQueueDb>,
  pending: PendingOperation[]
): Promise<Array<PendingOperation & { table: SyncTable }>> {
  const supported: Array<PendingOperation & { table: SyncTable }> = []

  for (const operation of pending) {
    if (isSupportedSyncTable(operation.table)) {
      supported.push(operation as PendingOperation & { table: SyncTable })
      continue
    }

    await db.delete('pending_sync', operation.key)
  }

  return supported
}

async function getQueueDb(): Promise<IDBPDatabase<SyncQueueDb> | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return null
  }

  return openDB<SyncQueueDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains('pending_sync')) {
        db.deleteObjectStore('pending_sync')
      }

      db.createObjectStore('pending_sync', { keyPath: 'key' })
    },
  })
}

export async function enqueuePending(
  userId: string,
  table: SyncTable,
  rows: SyncRow[]
): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  await db.put('pending_sync', {
    key: queueKey(userId, table),
    userId,
    table,
    rows,
  })

  db.close()
}

export async function clearPending(userId: string, table: SyncTable): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  await db.delete('pending_sync', queueKey(userId, table))
  db.close()
}

export async function getPendingQueueSummary(
  userId?: string
): Promise<PendingQueueSummary> {
  const db = await getQueueDb()
  if (!db) {
    return {
      operations: 0,
      rows: 0,
      tables: [],
      tableBreakdown: [],
    }
  }

  const pending = await db.getAll('pending_sync')
  const supportedPending = await pruneUnsupportedPendingOperations(db, pending)
  db.close()

  const relevant = userId
    ? supportedPending.filter(operation => operation.userId === userId)
    : supportedPending

  const tableBreakdownMap = relevant.reduce<Map<SyncTable, number>>((acc, operation) => {
    acc.set(operation.table, (acc.get(operation.table) ?? 0) + operation.rows.length)
    return acc
  }, new Map())

  return {
    operations: relevant.length,
    rows: relevant.reduce((total, operation) => total + operation.rows.length, 0),
    tables: [...new Set(relevant.map(operation => operation.table))],
    tableBreakdown: [...tableBreakdownMap.entries()].map(([table, rows]) => ({
      table,
      rows,
    })),
  }
}

async function logSyncAudit(
  userId: string,
  entity: string,
  payload: unknown,
  error?: string
): Promise<void> {
  try {
    const supabase = createClient()

    await supabase.from('audit_log').insert({
      user_id: userId,
      action: error ? 'SYNC_ERROR' : 'SYNC',
      entity,
      payload: {
        ok: !error,
        error: error ?? null,
        timestamp: new Date().toISOString(),
        ...(
          typeof payload === 'object' && payload !== null
            ? (payload as Record<string, unknown>)
            : { value: payload }
        ),
      },
    })
  } catch (auditError) {
    console.error('[Supabase Sync] No se pudo registrar audit_log.', auditError)
  }
}

export async function syncRowsSnapshot(
  userId: string,
  table: SyncTable,
  rows: SyncRow[],
  queueOnFailure = true
): Promise<SyncResult> {
  if (isBrowserOffline()) {
    if (queueOnFailure) {
      await enqueuePending(userId, table, rows)
    }

    return { success: false, error: 'offline_pending_sync' }
  }

  const supabase = createClient()
  const localIds = new Set(rows.map(row => String(row.id)))

  const { data: remoteIds, error: listError } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)

  if (listError) {
    if (isMissingOptionalSyncTableError(table, listError)) {
      await clearPending(userId, table)
      await logSyncAudit(userId, table, { stage: 'skip_missing_optional_table' })
      return { success: true }
    }

    if (queueOnFailure) {
      await enqueuePending(userId, table, rows)
    }

    await logSyncAudit(userId, table, { stage: 'list_ids' }, listError.message)
    return { success: false, error: listError.message }
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from(table)
      .upsert(rows, { onConflict: 'user_id,id' })

    if (upsertError) {
      if (isMissingOptionalSyncTableError(table, upsertError)) {
        await clearPending(userId, table)
        await logSyncAudit(userId, table, { stage: 'skip_missing_optional_table' })
        return { success: true }
      }

      if (queueOnFailure) {
        await enqueuePending(userId, table, rows)
      }

      await logSyncAudit(
        userId,
        table,
        { stage: 'upsert', rows: rows.length },
        upsertError.message
      )
      return { success: false, error: upsertError.message }
    }
  }

  const idsToDelete = (remoteIds ?? [])
    .map(row => String((row as { id: string }).id))
    .filter(id => !localIds.has(id))

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .in('id', idsToDelete)

    if (deleteError) {
      if (isMissingOptionalSyncTableError(table, deleteError)) {
        await clearPending(userId, table)
        await logSyncAudit(userId, table, { stage: 'skip_missing_optional_table' })
        return { success: true }
      }

      if (queueOnFailure) {
        await enqueuePending(userId, table, rows)
      }

      await logSyncAudit(
        userId,
        table,
        { stage: 'delete_missing', rows: idsToDelete.length },
        deleteError.message
      )
      return { success: false, error: deleteError.message }
    }
  }

  await clearPending(userId, table)
  await logSyncAudit(userId, table, {
    stage: 'complete',
    upserted: rows.length,
    deleted: idsToDelete.length,
  })

  return { success: true }
}

export async function flushPendingQueue(userId: string): Promise<void> {
  const db = await getQueueDb()
  if (!db) return

  const pending = await db.getAll('pending_sync')
  const supportedPending = await pruneUnsupportedPendingOperations(db, pending)
  db.close()

  const relevant = supportedPending.filter(operation => operation.userId === userId)

  for (const operation of relevant) {
    const result = await syncRowsSnapshot(
      operation.userId,
      operation.table,
      operation.rows,
      false
    )

    if (result.success) {
      await clearPending(operation.userId, operation.table)
    }
  }
}
