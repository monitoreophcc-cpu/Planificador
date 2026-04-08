'use client'

import { create } from 'zustand'
import type {
  PendingQueueSummary,
  PendingTableSummary,
} from '@/persistence/supabase-sync-types'
import type { CloudSyncStatus } from './useCloudSyncStore'

export type LocalPersistenceStatus =
  | 'checking'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'error'

type LocalPersistenceMeta = {
  status: LocalPersistenceStatus
  error: string | null
  lastSavedAt: string | null
}

type CloudSyncMeta = {
  status: CloudSyncStatus
  error: string | null
  lastAttemptAt: string | null
  lastSyncedAt: string | null
  pendingOperations: number
  pendingRows: number
  pendingTables: string[]
  pendingTableBreakdown: PendingTableSummary[]
}

type SyncHealthState = {
  local: LocalPersistenceMeta
  cloud: CloudSyncMeta
  markLocalReady: () => void
  markLocalPending: () => void
  markLocalSaving: () => void
  markLocalSaved: () => void
  markLocalError: (message: string) => void
  setCloudStatus: (status: CloudSyncStatus) => void
  markCloudAttempt: () => void
  markCloudSuccess: (summary: PendingQueueSummary) => void
  markCloudFailure: (
    status: Extract<CloudSyncStatus, 'offline' | 'error'>,
    message: string | null,
    summary: PendingQueueSummary
  ) => void
  markCloudUnauthenticated: (summary?: PendingQueueSummary) => void
  setPendingSummary: (summary: PendingQueueSummary) => void
}

function nowIso(): string {
  return new Date().toISOString()
}

function applyPendingSummary(
  cloud: CloudSyncMeta,
  summary: PendingQueueSummary
): CloudSyncMeta {
  return {
    ...cloud,
    pendingOperations: summary.operations,
    pendingRows: summary.rows,
    pendingTables: summary.tables,
    pendingTableBreakdown: summary.tableBreakdown,
  }
}

export const useSyncHealthStore = create<SyncHealthState>(set => ({
  local: {
    status: 'checking',
    error: null,
    lastSavedAt: null,
  },
  cloud: {
    status: 'checking',
    error: null,
    lastAttemptAt: null,
    lastSyncedAt: null,
    pendingOperations: 0,
    pendingRows: 0,
    pendingTables: [],
    pendingTableBreakdown: [],
  },
  markLocalReady: () =>
    set(state => ({
      local: {
        ...state.local,
        status: 'saved',
        error: null,
      },
    })),
  markLocalPending: () =>
    set(state => ({
      local: {
        ...state.local,
        status: 'pending',
        error: null,
      },
    })),
  markLocalSaving: () =>
    set(state => ({
      local: {
        ...state.local,
        status: 'saving',
        error: null,
      },
    })),
  markLocalSaved: () =>
    set({
      local: {
        status: 'saved',
        error: null,
        lastSavedAt: nowIso(),
      },
    }),
  markLocalError: message =>
    set(state => ({
      local: {
        ...state.local,
        status: 'error',
        error: message,
      },
    })),
  setCloudStatus: status =>
    set(state => ({
      cloud: {
        ...state.cloud,
        status,
      },
    })),
  markCloudAttempt: () =>
    set(state => ({
      cloud: {
        ...state.cloud,
        status: 'syncing',
        error: null,
        lastAttemptAt: nowIso(),
      },
    })),
  markCloudSuccess: summary =>
    set(state => ({
      cloud: applyPendingSummary(
        {
          ...state.cloud,
          status: 'synced',
          error: null,
          lastAttemptAt: nowIso(),
          lastSyncedAt: nowIso(),
        },
        summary
      ),
    })),
  markCloudFailure: (status, message, summary) =>
    set(state => ({
      cloud: applyPendingSummary(
        {
          ...state.cloud,
          status,
          error: message,
          lastAttemptAt: nowIso(),
        },
        summary
      ),
    })),
  markCloudUnauthenticated: summary =>
    set(state => ({
      cloud: applyPendingSummary(
        {
          ...state.cloud,
          status: 'unauthenticated',
          error: null,
          lastAttemptAt: nowIso(),
        },
        summary ?? {
          operations: 0,
          rows: 0,
          tables: [],
          tableBreakdown: [],
        }
      ),
    })),
  setPendingSummary: summary =>
    set(state => ({
      cloud: applyPendingSummary(state.cloud, summary),
    })),
}))
