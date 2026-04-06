import { Moon, Sun } from 'lucide-react'
import type { ExecutiveReport } from '@/domain/executiveReport/types'

interface ExecutiveShiftCardProps {
  shift: 'DAY' | 'NIGHT'
  stats: ExecutiveReport['shifts']['DAY']
}

export function ExecutiveShiftCard({
  shift,
  stats,
}: ExecutiveShiftCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: shift === 'DAY' ? '#b45309' : '#312e81',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        {shift === 'DAY' ? <Sun size={18} /> : <Moon size={18} />}
        <span>Turno {shift === 'DAY' ? 'Día' : 'Noche'}</span>
      </div>
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Incidencias
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.incidents}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Puntos</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.points}</div>
        </div>
      </div>
    </div>
  )
}
