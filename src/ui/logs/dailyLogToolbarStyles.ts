import { CSSProperties } from 'react'
import { DailyLogFilterMode } from './DailyLogToolbar'

const controlButtonStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  border: '1px solid rgba(137, 149, 161, 0.18)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(247, 248, 249, 0.96) 100%)',
  borderRadius: '999px',
  color: 'var(--text-main)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
}

const activeFilterButtonStyle: CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(var(--accent-rgb), 0.18) 0%, rgba(var(--accent-rgb), 0.1) 100%)',
  color: 'var(--accent-strong)',
  borderColor: 'rgba(var(--accent-rgb), 0.2)',
}

const inactiveFilterButtonStyle: CSSProperties = {
  background: 'transparent',
  color: 'var(--text-muted)',
  borderColor: 'transparent',
}

export function getDailyLogControlButtonStyle(): CSSProperties {
  return controlButtonStyle
}

export function getDailyLogFilterButtonStyle(
  activeMode: DailyLogFilterMode,
  mode: DailyLogFilterMode
): CSSProperties {
  return {
    minHeight: '32px',
    padding: '0 14px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow:
      activeMode === mode ? '0 8px 14px rgba(var(--accent-rgb), 0.12)' : 'none',
    whiteSpace: 'nowrap',
    ...(activeMode === mode
      ? activeFilterButtonStyle
      : inactiveFilterButtonStyle),
  }
}
