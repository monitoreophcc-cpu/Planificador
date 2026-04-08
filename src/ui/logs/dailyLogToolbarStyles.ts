import { CSSProperties } from 'react'
import { DailyLogFilterMode } from './DailyLogToolbar'

const controlButtonStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '999px',
  color: '#334155',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 20px rgba(15, 23, 42, 0.04)',
}

const activeFilterButtonStyle: CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--text-on-accent)',
  borderColor: 'var(--accent)',
}

const inactiveFilterButtonStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  color: '#475569',
  borderColor: 'rgba(148, 163, 184, 0.18)',
}

export function getDailyLogControlButtonStyle(): CSSProperties {
  return controlButtonStyle
}

export function getDailyLogFilterButtonStyle(
  activeMode: DailyLogFilterMode,
  mode: DailyLogFilterMode
): CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow:
      activeMode === mode ? '0 10px 18px rgba(37, 99, 235, 0.12)' : 'none',
    ...(activeMode === mode
      ? activeFilterButtonStyle
      : inactiveFilterButtonStyle),
  }
}
