import { BackupPayload } from './types'
import { DOMAIN_VERSION } from '@/store/appStoreConstants'
import { normalizeAuditLog } from '@/domain/audit/normalizeAuditEvent'

const LEGACY_SUPPORTED_BACKUP_VERSIONS = [7] as const

function isSupportedBackupVersion(version: unknown): version is number {
  return (
    typeof version === 'number' &&
    (version === DOMAIN_VERSION ||
      LEGACY_SUPPORTED_BACKUP_VERSIONS.includes(
        version as (typeof LEGACY_SUPPORTED_BACKUP_VERSIONS)[number]
      ))
  )
}

export function parseBackup(text: string): BackupPayload {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es JSON válido.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de respaldo inválido.')
  }

  const payload = parsed as BackupPayload

  if (!isSupportedBackupVersion(payload.version)) {
    throw new Error(
      `Versión incompatible. Compatibles: ${[
        ...LEGACY_SUPPORTED_BACKUP_VERSIONS,
        DOMAIN_VERSION,
      ].join(', ')}, recibida ${
        payload.version || 'desconocida'
      }`
    )
  }

  if (!Array.isArray(payload.representatives)) {
    throw new Error('Respaldo corrupto: representantes inválidos.')
  }

  if (!Array.isArray(payload.incidents)) {
    throw new Error('Respaldo corrupto: incidencias inválidas.')
  }

  payload.auditLog = normalizeAuditLog(payload.auditLog)
  payload.coverages = Array.isArray(payload.coverages) ? payload.coverages : []

  return payload
}
