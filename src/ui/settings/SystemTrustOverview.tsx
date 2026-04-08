'use client'

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cloud,
  HardDrive,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { useSession } from '@/hooks/useSession'
import { useAppStore } from '@/store/useAppStore'
import { useSyncHealthStore } from '@/store/useSyncHealthStore'
import {
  describeQueueState,
  formatPendingTableSummary,
} from './systemTrustOverviewUtils'

type SystemTrustOverviewProps = {
  latestLocalBackupAt?: string | null
}

type TrustTone = {
  background: string
  border: string
  text: string
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Aun sin registro'
  }

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toneForState(kind: 'neutral' | 'success' | 'warning' | 'danger'): TrustTone {
  switch (kind) {
    case 'success':
      return {
        background: '#f0fdf4',
        border: '#86efac',
        text: '#166534',
      }
    case 'warning':
      return {
        background: '#fffbeb',
        border: '#fcd34d',
        text: '#b45309',
      }
    case 'danger':
      return {
        background: '#fef2f2',
        border: '#fca5a5',
        text: '#b91c1c',
      }
    default:
      return {
        background: '#f8fafc',
        border: '#cbd5e1',
        text: '#334155',
      }
  }
}

function statusTone(status: string): TrustTone {
  if (status === 'saved' || status === 'synced') {
    return toneForState('success')
  }

  if (
    status === 'pending' ||
    status === 'saving' ||
    status === 'syncing' ||
    status === 'checking'
  ) {
    return toneForState('warning')
  }

  if (status === 'error' || status === 'offline') {
    return toneForState('danger')
  }

  return toneForState('neutral')
}

function localLabel(status: string): string {
  switch (status) {
    case 'checking':
      return 'Verificando almacenamiento'
    case 'pending':
      return 'Cambios pendientes de guardar'
    case 'saving':
      return 'Guardando en este dispositivo'
    case 'saved':
      return 'Guardado local al dia'
    case 'error':
      return 'Error al guardar localmente'
    default:
      return status
  }
}

function cloudLabel(status: string, pendingRows: number): string {
  switch (status) {
    case 'checking':
      return 'Verificando nube'
    case 'unauthenticated':
      return pendingRows > 0
        ? `Pendiente sin sesion (${pendingRows})`
        : 'Sin sesion en nube'
    case 'syncing':
      return pendingRows > 0
        ? `Sincronizando (${pendingRows})`
        : 'Sincronizando'
    case 'offline':
      return pendingRows > 0
        ? `Sin conexion (${pendingRows} pendientes)`
        : 'Sin conexion'
    case 'error':
      return pendingRows > 0
        ? `Error (${pendingRows} pendientes)`
        : 'Error de sync'
    case 'synced':
      return 'Sincronizado con la nube'
    default:
      return status
  }
}

function sessionLabel(loading: boolean, hasUser: boolean): string {
  if (loading) {
    return 'Verificando sesion'
  }

  return hasUser ? 'Sesion conectada' : 'Sesion requerida'
}

export function SystemTrustOverview({
  latestLocalBackupAt = null,
}: SystemTrustOverviewProps) {
  const { user, loading, signOut } = useSession()
  const triggerCloudSync = useAppStore(state => state.triggerCloudSync)
  const local = useSyncHealthStore(state => state.local)
  const cloud = useSyncHealthStore(state => state.cloud)

  const sessionTone = statusTone(
    loading ? 'checking' : user ? 'synced' : 'unauthenticated'
  )
  const localTone = statusTone(local.status)
  const cloudTone = statusTone(cloud.status)
  const hasPendingQueue =
    cloud.pendingOperations > 0 || cloud.pendingRows > 0
  const queueDescriptor = describeQueueState(
    {
      status: cloud.status,
      error: cloud.error,
      pendingOperations: cloud.pendingOperations,
      pendingRows: cloud.pendingRows,
    },
    Boolean(user)
  )
  const queueTone = toneForState(queueDescriptor.tone)
  const QueueStateIcon =
    queueDescriptor.tone === 'success'
      ? CheckCircle2
      : queueDescriptor.tone === 'danger'
        ? AlertTriangle
        : Clock3

  const cards = [
    {
      key: 'session',
      icon: ShieldCheck,
      title: 'Sesion',
      label: sessionLabel(loading, Boolean(user)),
      tone: sessionTone,
      detail: user?.email ?? 'La sincronizacion en nube requiere una sesion activa.',
      meta: loading ? 'Esperando respuesta de Supabase Auth' : null,
      action:
        user && !loading ? (
          <button
            type="button"
            onClick={() => void signOut()}
            style={{
              marginTop: '12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--text-main)',
              padding: '8px 10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Salir
          </button>
        ) : null,
    },
    {
      key: 'local',
      icon: HardDrive,
      title: 'Este dispositivo',
      label: localLabel(local.status),
      tone: localTone,
      detail:
        local.status === 'error' && local.error
          ? local.error
          : 'IndexedDB sigue siendo la base operativa local.',
      meta:
        local.lastSavedAt || latestLocalBackupAt
          ? [
              `Ultimo guardado operativo: ${formatTimestamp(local.lastSavedAt)}`,
              `Ultimo respaldo local: ${formatTimestamp(latestLocalBackupAt)}`,
            ]
              .filter(line => !line.endsWith('Aun sin registro'))
              .join(' | ')
          : 'Ultimo guardado: Aun sin registro',
      action: null,
    },
    {
      key: 'cloud',
      icon: Cloud,
      title: 'Nube',
      label: cloudLabel(cloud.status, cloud.pendingRows),
      tone: cloudTone,
      detail:
        cloud.status === 'error' && cloud.error
          ? cloud.error
          : user
            ? 'Supabase replica y respalda tus cambios por usuario.'
            : 'Inicia sesion para sincronizar con Supabase.',
      meta:
        cloud.lastSyncedAt
          ? `Ultima sync correcta: ${formatTimestamp(cloud.lastSyncedAt)}`
          : `Ultimo intento: ${formatTimestamp(cloud.lastAttemptAt)}`,
      action: null,
    },
  ]

  return (
    <div
      style={{
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {cards.map(card => {
          const Icon = card.icon

          return (
            <section
              key={card.key}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${card.tone.border}`,
                background: card.tone.background,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  color: card.tone.text,
                  fontWeight: 700,
                }}
              >
                <Icon size={16} />
                {card.title}
              </div>

              <div
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                {card.detail}
              </div>

              {card.meta ? (
                <div
                  style={{
                    fontSize: '12px',
                    color: card.tone.text,
                  }}
                >
                  {card.meta}
                </div>
              ) : null}

              {card.action}
            </section>
          )
        })}
      </div>

      <section
        style={{
          padding: '18px',
          borderRadius: '16px',
          border: `1px solid ${queueTone.border}`,
          background: queueTone.background,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: queueTone.text,
                fontWeight: 700,
              }}
            >
              <QueueStateIcon size={16} />
              Cola de sincronizacion
            </div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '6px',
              }}
            >
              {queueDescriptor.title}
            </div>
            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.55,
                color: 'var(--text-muted)',
                maxWidth: '72ch',
              }}
            >
              {queueDescriptor.description}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void triggerCloudSync()}
            disabled={!user || loading || cloud.status === 'syncing'}
            style={{
              border: `1px solid ${queueTone.border}`,
              background: 'white',
              color: queueTone.text,
              borderRadius: '10px',
              padding: '10px 14px',
              fontWeight: 700,
              cursor:
                !user || loading || cloud.status === 'syncing'
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                !user || loading || cloud.status === 'syncing' ? 0.65 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            title={
              user
                ? 'Forzar un nuevo intento de sincronizacion'
                : 'Necesitas una sesion activa para subir la cola'
            }
          >
            <RefreshCcw size={14} />
            {cloud.status === 'syncing' ? 'Reintentando...' : 'Reintentar sync'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            {
              label: 'Bloques pendientes',
              value: String(cloud.pendingOperations),
            },
            {
              label: 'Registros en cola',
              value: String(cloud.pendingRows),
            },
            {
              label: 'Ultimo intento',
              value: formatTimestamp(cloud.lastAttemptAt),
            },
            {
              label: 'Ultima sync correcta',
              value: formatTimestamp(cloud.lastSyncedAt),
            },
          ].map(item => (
            <div
              key={item.label}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.72)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748b',
                  marginBottom: '6px',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: queueTone.text,
            }}
          >
            Tablas afectadas
          </div>

          {cloud.pendingTableBreakdown.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {cloud.pendingTableBreakdown.map(tableSummary => (
                <span
                  key={tableSummary.table}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {formatPendingTableSummary(tableSummary)}
                </span>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.64)',
                border: '1px dashed rgba(148, 163, 184, 0.32)',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              {hasPendingQueue
                ? 'La cola sigue pendiente, pero todavia no hay desglose por tabla disponible.'
                : 'La cola esta vacia; no hay tablas pendientes ahora mismo.'}
            </div>
          )}

          {cloud.status === 'error' && cloud.error ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.76)',
                border: '1px solid rgba(220, 38, 38, 0.22)',
                color: '#991b1b',
                fontSize: '13px',
                lineHeight: 1.55,
              }}
            >
              {cloud.error}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
