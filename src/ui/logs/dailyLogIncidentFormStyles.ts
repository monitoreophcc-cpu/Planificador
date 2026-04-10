import type { CSSProperties } from 'react'

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontWeight: 500,
  fontSize: '0.875rem',
  color: 'var(--text-main)',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-subtle)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-main)',
}

const submitButtonStyle: CSSProperties = {
  padding: '10px 16px',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-semibold)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  width: '100%',
  transition: 'background-color 0.2s',
}

export function getDailyLogIncidentLabelStyle(): CSSProperties {
  return labelStyle
}

export function getDailyLogIncidentInputStyle(): CSSProperties {
  return inputStyle
}

export function getDailyLogIncidentTextareaStyle(): CSSProperties {
  return {
    ...inputStyle,
    minHeight: '72px',
  }
}

export function getDailyLogIncidentSubmitStyle(
  disabled: boolean
): CSSProperties {
  return {
    ...submitButtonStyle,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--text-on-accent)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}
