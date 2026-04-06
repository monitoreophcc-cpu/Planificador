'use client'

import { Plus } from 'lucide-react'

type ManagerScheduleCreateRowProps = {
  newManagerName: string
  onCreateManager: () => void
  onNewManagerNameChange: (value: string) => void
}

export function ManagerScheduleCreateRow({
  newManagerName,
  onCreateManager,
  onNewManagerNameChange,
}: ManagerScheduleCreateRowProps) {
  return (
    <tr style={{ background: 'var(--bg-subtle)' }}>
      <td style={{ padding: 'var(--space-md)' }} colSpan={2}>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input
            placeholder="Nuevo Supervisor..."
            value={newManagerName}
            onChange={event => onNewManagerNameChange(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && onCreateManager()}
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-sm)',
              fontSize: 'var(--font-size-base)',
              flex: 1,
              outline: 'none',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
            }}
          />
          <button
            onClick={onCreateManager}
            disabled={!newManagerName.trim()}
            style={{
              background: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: !newManagerName.trim() ? 0.5 : 1,
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </td>
      <td colSpan={8}></td>
    </tr>
  )
}
