import type {
  PendingTableSummary,
  SyncTable,
} from '@/persistence/supabase-sync-types'
import type { CloudSyncStatus } from '@/store/useCloudSyncStore'

export type QueueDescriptorTone = 'neutral' | 'success' | 'warning' | 'danger'

export type QueueDescriptor = {
  title: string
  description: string
  tone: QueueDescriptorTone
}

export type QueueDescriptorInput = {
  status: CloudSyncStatus
  error: string | null
  pendingOperations: number
  pendingRows: number
}

const syncTableLabels: Record<SyncTable, string> = {
  representatives: 'Representantes',
  weekly_plans: 'Planes semanales',
  incidents: 'Incidencias',
  swaps: 'Cambios de turno',
  coverage_rules: 'Reglas de cobertura',
}

export function formatPendingTableLabel(table: SyncTable): string {
  return syncTableLabels[table]
}

export function formatPendingTableSummary(
  tableSummary: PendingTableSummary
): string {
  return `${formatPendingTableLabel(tableSummary.table)} (${tableSummary.rows})`
}

export function describeQueueState(
  queue: QueueDescriptorInput,
  hasUser: boolean
): QueueDescriptor {
  const hasPending =
    queue.pendingOperations > 0 || queue.pendingRows > 0

  if (!hasPending) {
    return {
      title: 'Cola vacía',
      description: 'No hay cambios pendientes por subir a la nube.',
      tone: 'success',
    }
  }

  if (queue.status === 'syncing') {
    return {
      title: 'Procesando cola',
      description:
        'La app está subiendo los cambios pendientes a la nube en este momento.',
      tone: 'warning',
    }
  }

  if (queue.status === 'offline') {
    return {
      title: 'Cola en espera',
      description:
        'Los cambios quedan seguros en este dispositivo y se subirán cuando vuelva la conexión.',
      tone: 'warning',
    }
  }

  if (queue.status === 'error') {
    return {
      title: 'Cola atascada',
      description:
        queue.error?.trim() ??
        'El último intento falló y la cola sigue pendiente hasta que se reintente.',
      tone: 'danger',
    }
  }

  if (queue.status === 'unauthenticated' || !hasUser) {
    return {
      title: 'Cola pausada',
      description:
        'Hay cambios preparados, pero hace falta una sesión activa para enviarlos a la nube.',
      tone: 'neutral',
    }
  }

  return {
    title: 'Cola pendiente',
    description:
      'Hay cambios listos para subirse en cuanto termine el siguiente intento de sincronización.',
    tone: 'warning',
  }
}
