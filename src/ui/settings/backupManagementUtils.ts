import type {
  AutoBackupRecord,
  BackupRecord,
  BackupSnapshotSummary,
} from '@/application/backup/metadata'
export { AUTO_BACKUP_KEY } from '@/application/backup/metadata'

export type BackupListEntry = BackupRecord
export type AutoBackupMetadata = AutoBackupRecord

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

export function formatBackupKindLabel(
  kind: BackupListEntry['kind'] | AutoBackupMetadata['kind']
): string {
  switch (kind) {
    case 'auto':
      return 'AUTO'
    case 'recovery':
      return 'RECUPERACION'
    default:
      return 'MANUAL'
  }
}

export function describeBackupKind(
  kind: BackupListEntry['kind'] | AutoBackupMetadata['kind']
): string {
  switch (kind) {
    case 'auto':
      return 'Sirve como ultimo punto seguro automatico del navegador.'
    case 'recovery':
      return 'Se crea antes de restaurar o importar para que puedas deshacer la recuperacion.'
    default:
      return 'Ideal para guardar un punto seguro antes de cambios grandes o ajustes delicados.'
  }
}

export function formatBackupSummary(summary: BackupSnapshotSummary): string[] {
  return [
    `${summary.representatives} reps`,
    `${summary.incidents} incidencias`,
    `${summary.swaps} cambios`,
    `${summary.coverageRules} reglas`,
    `${summary.coverages} coberturas`,
  ]
}

export function buildRecoveryConfirmationMessage(
  label: string,
  summary: BackupSnapshotSummary
): string {
  return [
    `Vas a restaurar ${label}.`,
    '',
    'Contenido del respaldo:',
    `- ${summary.representatives} representantes`,
    `- ${summary.incidents} incidencias`,
    `- ${summary.swaps} cambios de turno`,
    `- ${summary.coverageRules} reglas de cobertura`,
    `- ${summary.coverages} coberturas`,
    '',
    'Antes de reemplazar el estado actual, la app guardara un respaldo de recuperacion en este navegador.',
    '¿Deseas continuar?',
  ].join('\n')
}
