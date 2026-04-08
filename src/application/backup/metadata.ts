import type { BackupPayload } from './types'

export type BackupStorageKind = 'manual' | 'auto' | 'recovery'

export type BackupSnapshotSummary = {
  representatives: number
  incidents: number
  swaps: number
  coverageRules: number
  coverages: number
}

export type BackupMetadata = {
  kind: BackupStorageKind
  timestamp: string
  exportedAt: string | null
  appVersion: number | null
  domainVersion: number | null
  summary: BackupSnapshotSummary
}

export type BackupRecord = BackupMetadata & {
  key: string
  size: number
}

export type AutoBackupRecord = BackupMetadata & {
  size: number
}

export const AUTO_BACKUP_KEY = 'planning-backup-auto-latest'

export function summarizeBackupPayload(
  payload: BackupPayload
): BackupSnapshotSummary {
  return {
    representatives: payload.representatives.length,
    incidents: payload.incidents.length,
    swaps: payload.swaps.length,
    coverageRules: payload.coverageRules.length,
    coverages: Array.isArray(payload.coverages) ? payload.coverages.length : 0,
  }
}

export function createBackupMetadata(
  payload: BackupPayload,
  kind: BackupStorageKind,
  timestamp: string
): BackupMetadata {
  return {
    kind,
    timestamp,
    exportedAt: payload.exportedAt ?? null,
    appVersion:
      typeof payload.appVersion === 'number' ? payload.appVersion : null,
    domainVersion: typeof payload.version === 'number' ? payload.version : null,
    summary: summarizeBackupPayload(payload),
  }
}

export function resolveBackupKindFromKey(key: string): BackupStorageKind {
  if (key === AUTO_BACKUP_KEY || key.includes('-auto-')) {
    return 'auto'
  }

  if (key.includes('-recovery-')) {
    return 'recovery'
  }

  return 'manual'
}

export function resolveBackupTimestampFromKey(key: string): string {
  if (key === AUTO_BACKUP_KEY) {
    return new Date().toISOString()
  }

  return key
    .replace('planning-backup-manual-', '')
    .replace('planning-backup-recovery-', '')
    .replace('planning-backup-', '')
}

export function buildBackupStorageKey(
  type: BackupStorageKind,
  timestamp: string
): string {
  if (type === 'auto') {
    return AUTO_BACKUP_KEY
  }

  return `planning-backup-${type}-${timestamp}`
}
