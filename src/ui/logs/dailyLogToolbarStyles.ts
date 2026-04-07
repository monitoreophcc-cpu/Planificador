import { CSSProperties } from 'react'
import { DailyLogFilterMode } from './DailyLogToolbar'

const controlButtonStyle: CSSProperties = {
  padding: '8px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  cursor: 'pointer',
}

const activeFilterButtonStyle: CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--text-on-accent)',
  borderColor: 'var(--accent)',
}

const inactiveFilterButtonStyle: CSSProperties = {
  background: 'var(--bg-surface)',
  color: 'var(--text-main)',
  borderColor: 'var(--border-subtle)',
}

export function getDailyLogControlButtonStyle(): CSSProperties {
  return controlButtonStyle
}

export function getDailyLogFilterButtonStyle(
  activeMode: DailyLogFilterMode,
  mode: DailyLogFilterMode
): CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    ...(activeMode === mode
      ? activeFilterButtonStyle
      : inactiveFilterButtonStyle),
  }
}
