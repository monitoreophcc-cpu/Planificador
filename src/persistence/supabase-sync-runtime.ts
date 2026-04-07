import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createClient } from '@/lib/supabase/client'
import type { SyncResult, SyncRow, SyncTable } from './supabase-sync-types'

type PendingOperation = {
  key: string
  userId: string
  table: SyncTable
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

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unexpected_sync_error'
}

function queueKey(userId: string, table: SyncTable): string {
  return `${userId}:${table}`
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
  db.close()

  const relevant = pending.filter(operation => operation.userId === userId)

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
