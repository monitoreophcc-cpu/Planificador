import type { CSSProperties } from 'react'

export const dailyLogSidebarStyles = {
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#374151',
  } satisfies CSSProperties,
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  } satisfies CSSProperties,
  listItem: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid transparent',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'block',
    width: '100%',
    color: '#374151',
  } satisfies CSSProperties,
  activeListItem: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#1e40af',
    fontWeight: 600,
  } satisfies CSSProperties,
}
