export interface BackupListEntry {
  key: string
  size: number
  timestamp: string
}

export interface AutoBackupMetadata {
  size: number
  timestamp: string
}

export const AUTO_BACKUP_KEY = 'planning-backup-auto-latest'

export function formatBackupDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timestamp
  }
}

export function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
