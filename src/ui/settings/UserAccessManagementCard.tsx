'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shield, UserPlus, UserRoundMinus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAccessStore } from '@/store/useAccessStore'

type AccessRoleRow = {
  user_id: string
  role: 'OWNER' | 'READER'
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'No se pudo completar la operación en este momento.'
}

export function UserAccessManagementCard() {
  const role = useAccessStore(state => state.role)
  const canManage = useAccessStore(state => state.canManageRoles)
  const sessionUserId = useAccessStore(state => state.sessionUserId)

  const [roles, setRoles] = useState<AccessRoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [readerUserId, setReaderUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const owner = useMemo(
    () => roles.find(row => row.role === 'OWNER') ?? null,
    [roles]
  )

  const readers = useMemo(
    () => roles.filter(row => row.role === 'READER'),
    [roles]
  )

  async function loadRoles() {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: listError } = await supabase
        .from('app_access_roles')
        .select('user_id, role')
        .order('role', { ascending: true })
        .order('user_id', { ascending: true })

      if (listError) {
        throw listError
      }

      setRoles((data ?? []) as AccessRoleRow[])
    } catch (requestError) {
      setError(formatError(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRoles()
  }, [])

  async function handleAddReader() {
    const normalizedUserId = readerUserId.trim()

    if (!normalizedUserId) {
      setError('Ingresa el user_id de la cuenta que habilitarás.')
      return
    }

    setBusy(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error: upsertError } = await supabase.from('app_access_roles').upsert(
        {
          user_id: normalizedUserId,
          role: 'READER',
        },
        { onConflict: 'user_id' }
      )

      if (upsertError) {
        throw upsertError
      }

      setReaderUserId('')
      setSuccess('Cuenta agregada en modo solo lectura.')
      await loadRoles()
    } catch (requestError) {
      setError(formatError(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveReader(userId: string) {
    setBusy(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('app_access_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'READER')

      if (deleteError) {
        throw deleteError
      }

      setSuccess('Cuenta removida de la lista de solo lectura.')
      await loadRoles()
    } catch (requestError) {
      setError(formatError(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      style={{
        border: '1px solid rgba(148, 163, 184, 0.28)',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={16} color="#0369a1" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            Usuarios con acceso
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configura quién puede entrar y en qué modo.
          </div>
        </div>
      </header>

      <div
        style={{
          fontSize: '13px',
          color: '#334155',
          background: '#f8fafc',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '12px',
          padding: '10px 12px',
          lineHeight: 1.55,
        }}
      >
        <strong>Usuario principal:</strong>{' '}
        {loading ? 'Cargando...' : owner?.user_id ?? 'Sin definir'}
        <br />
        <strong>Tu sesión:</strong> {sessionUserId ?? 'Sin sesión'} ·{' '}
        <strong>Rol:</strong> {role ?? 'Pendiente'}
      </div>

      {canManage ? (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={readerUserId}
            onChange={event => setReaderUserId(event.target.value)}
            placeholder="user_id de cuenta solo lectura"
            disabled={busy || loading}
            style={{
              flex: '1 1 260px',
              minWidth: '200px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              padding: '10px 12px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => void handleAddReader()}
            disabled={busy || loading}
            style={{
              border: '1px solid rgba(3, 105, 161, 0.35)',
              background: '#e0f2fe',
              color: '#075985',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: busy || loading ? 'not-allowed' : 'pointer',
            }}
          >
            <UserPlus size={14} />
            Habilitar solo lectura
          </button>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Solo el usuario principal puede modificar los accesos.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
          Cuentas en modo solo lectura ({readers.length})
        </div>

        {readers.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Todavía no hay cuentas de solo lectura habilitadas.
          </div>
        ) : (
          readers.map(reader => (
            <div
              key={reader.user_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: '10px',
                padding: '10px 12px',
                background: 'white',
              }}
            >
              <code style={{ fontSize: '12px', color: '#334155' }}>{reader.user_id}</code>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => void handleRemoveReader(reader.user_id)}
                  disabled={busy || loading}
                  style={{
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: busy || loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <UserRoundMinus size={12} />
                  Quitar
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      {error ? <div style={{ color: '#b91c1c', fontSize: '13px' }}>{error}</div> : null}
      {success ? <div style={{ color: '#166534', fontSize: '13px' }}>{success}</div> : null}
    </section>
  )
}
