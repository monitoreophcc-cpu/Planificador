import { CSSProperties } from 'react'
import { DailyLogFilterMode } from './DailyLogToolbar'

const controlButtonStyle: CSSProperties = {
  width: '50px',
  height: '50px',
  border: '1px solid var(--shell-border)',
  background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
  borderRadius: '999px',
  color: 'var(--text-main)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--shadow-sm)',
}

const activeFilterButtonStyle: CSSProperties = {
  background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
  color: 'var(--text-on-accent)',
  borderColor: 'rgba(var(--accent-rgb), 0.24)',
}

const inactiveFilterButtonStyle: CSSProperties = {
  background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.64) 100%)',
  color: 'var(--text-muted)',
  borderColor: 'var(--shell-border)',
}

export function getDailyLogControlButtonStyle(): CSSProperties {
  return controlButtonStyle
}

export function getDailyLogFilterButtonStyle(
  activeMode: DailyLogFilterMode,
  mode: DailyLogFilterMode
): CSSProperties {
  return {
    minHeight: '54px',
    padding: '0 22px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow:
      activeMode === mode ? '0 12px 20px rgba(var(--accent-rgb), 0.14)' : 'none',
    ...(activeMode === mode
      ? activeFilterButtonStyle
      : inactiveFilterButtonStyle),
  }
}
