import type { CSSProperties } from 'react'

export const dailyLogSidebarStyles = {
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'var(--text-main)',
    letterSpacing: '-0.01em',
  } satisfies CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: 'transparent',
    color: 'var(--text-main)',
  } satisfies CSSProperties,
  listItem: {
    padding: '10px 12px',
    borderRadius: '14px',
    border: '1px solid rgba(95, 109, 125, 0.12)',
    background: 'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.58) 100%)',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'block',
    width: '100%',
    color: 'var(--text-main)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
  } satisfies CSSProperties,
  activeListItem: {
    background:
      'linear-gradient(180deg, rgba(var(--accent-rgb), 0.12) 0%, var(--surface-raised) 100%)',
    borderColor: 'rgba(var(--accent-rgb), 0.18)',
    color: 'var(--accent-strong)',
    fontWeight: 600,
    boxShadow: '0 14px 24px rgba(var(--accent-rgb), 0.1)',
  } satisfies CSSProperties,
}
