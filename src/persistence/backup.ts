import type { BackupPayload } from '@/application/backup/types'
import {
  AUTO_BACKUP_KEY,
  type AutoBackupRecord,
  type BackupRecord,
  buildBackupStorageKey,
  createBackupMetadata,
  resolveBackupKindFromKey,
  resolveBackupTimestampFromKey,
} from '@/application/backup/metadata'
import { parseBackup } from '@/application/backup/import'

/**
 * Exports the current application state as a JSON file
 */
export function exportBackup(state: BackupPayload, filename?: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const defaultFilename = `planning-backup-${timestamp}.json`

    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || defaultFilename
    link.click()

    URL.revokeObjectURL(url)
}

/**
 * Imports application state from a JSON file
 */
export function importBackup(file: File): Promise<BackupPayload> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const state = parseBackup(content)
                resolve(state)
            } catch (error) {
                reject(new Error((error as Error).message))
            }
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsText(file)
    })
}

/**
 * Gets list of backups from localStorage
 */
export function getBackupHistory(): BackupRecord[] {
    const backups: BackupRecord[] = []

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        // STRICT separation: Manual backups only in this list
        // We explicitly exclude the fixed auto-backup key
        if (key?.startsWith('planning-backup-') && key !== AUTO_BACKUP_KEY) {
            const value = localStorage.getItem(key)
            if (value) {
                try {
                    const payload = parseBackup(value)
                    const kind = resolveBackupKindFromKey(key)
                    const timestamp = resolveBackupTimestampFromKey(key)

                    backups.push({
                        key,
                        size: new Blob([value]).size,
                        ...createBackupMetadata(payload, kind, timestamp),
                    })
                } catch {
                    continue
                }
            }
        }
    }

    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/**
 * Gets the auto-backup metadata if it exists
 */
export function getAutoBackupMetadata(): AutoBackupRecord | null {
    const key = AUTO_BACKUP_KEY
    const value = localStorage.getItem(key)
    if (!value) return null

    try {
        const payload = parseBackup(value)
        const lastRun = localStorage.getItem('planning-auto-backup-last-run')
        const timestamp = lastRun || payload.exportedAt || new Date().toISOString()

        return {
            size: new Blob([value]).size,
            ...createBackupMetadata(payload, 'auto', timestamp),
        }
    } catch {
        return null
    }
}

/**
 * Saves a backup to localStorage
 */
export function saveBackupToLocalStorage(state: BackupPayload, type: 'manual' | 'auto' | 'recovery' = 'manual'): void {
    const timestamp = new Date().toISOString()
    const key = buildBackupStorageKey(type, timestamp)

    const value = JSON.stringify(state)

    try {
        localStorage.setItem(key, value)
        if (type === 'auto') {
            localStorage.setItem('planning-auto-backup-last-run', timestamp)
        }
    } catch (error) {
        const backups = getBackupHistory()
        if (backups.length > 0) {
            localStorage.removeItem(backups[backups.length - 1].key)
            try {
                localStorage.setItem(key, value)
                if (type === 'auto') {
                    localStorage.setItem('planning-auto-backup-last-run', timestamp)
                }
            } catch {
                throw new Error('No se pudo guardar el respaldo en este navegador.')
            }
        } else {
            console.error("Storage full, cannot save backup", error)
            throw new Error('No se pudo guardar el respaldo en este navegador.')
        }
    }
}

/**
 * Checks if an auto-backup is needed (every 24h)
 */
export function shouldRunAutoBackup(): boolean {
    const lastRun = localStorage.getItem('planning-auto-backup-last-run')
    if (!lastRun) return true

    const lastDate = new Date(lastRun).getTime()
    const now = new Date().getTime()
    const hoursSince = (now - lastDate) / (1000 * 60 * 60)

    return hoursSince >= 24
}

/**
 * Gets the last backup date (manual or auto)
 */
export function getLastBackupDate(): Date | null {
    const history = getBackupHistory()
    if (history.length === 0) return null
    // History is sorted desc
    return new Date(history[0].timestamp)
}

/**
 * Loads a backup from localStorage
 */
export function loadBackupFromLocalStorage(key: string): BackupPayload | null {
    const value = localStorage.getItem(key)
    if (!value) return null

    try {
        return parseBackup(value)
    } catch {
        return null
    }
}

/**
 * Deletes a backup from localStorage
 */
export function deleteBackupFromLocalStorage(key: string): void {
    localStorage.removeItem(key)
}
