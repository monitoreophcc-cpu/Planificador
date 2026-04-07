import type { CSSProperties } from 'react'

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'color-mix(in srgb, var(--text-main) 35%, transparent)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
}

const dialogStyle: CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-lg)',
  width: '400px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
  color: 'var(--text-main)',
}

const bodyStyle: CSSProperties = {
  textAlign: 'center',
}

const helperTextStyle: CSSProperties = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  margin: 0,
}

const representativeNameStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 800,
  color: 'var(--text-main)',
  margin: '4px 0 0',
}

const selectorPanelStyle: CSSProperties = {
  padding: '16px',
  borderRadius: 'var(--radius-lg)',
  border: '2px solid var(--border-subtle)',
  background: 'var(--bg-subtle)',
}

const selectorTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  marginBottom: '12px',
  color: 'var(--text-main)',
  textAlign: 'center',
}

const selectorOptionBaseStyle: CSSProperties = {
  flex: 1,
  padding: '14px',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface)',
  cursor: 'pointer',
}

const cancelButtonStyle: CSSProperties = {
  flex: 1,
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-surface)',
  color: 'var(--text-main)',
  fontWeight: 600,
  cursor: 'pointer',
}

export function getAbsenceOverlayStyle(): CSSProperties {
  return overlayStyle
}

export function getAbsenceDialogStyle(): CSSProperties {
  return dialogStyle
}

export function getAbsenceTitleStyle(): CSSProperties {
  return titleStyle
}

export function getAbsenceBodyStyle(): CSSProperties {
  return bodyStyle
}

export function getAbsenceHelperTextStyle(): CSSProperties {
  return helperTextStyle
}

export function getAbsenceRepresentativeNameStyle(): CSSProperties {
  return representativeNameStyle
}

export function getAbsenceSelectorPanelStyle(): CSSProperties {
  return selectorPanelStyle
}

export function getAbsenceSelectorTitleStyle(): CSSProperties {
  return selectorTitleStyle
}

export function getAbsenceSelectorOptionStyle(
  selected: boolean,
  variant: 'justified' | 'unjustified'
): CSSProperties {
  const semanticColor = variant === 'justified' ? 'var(--success)' : 'var(--danger)'

  return {
    ...selectorOptionBaseStyle,
    border: selected
      ? `2px solid ${semanticColor}`
      : '1px solid var(--border-subtle)',
    color: selected ? semanticColor : 'var(--text-main)',
    background: selected
      ? `color-mix(in srgb, ${semanticColor} 12%, var(--bg-surface))`
      : 'var(--bg-surface)',
  }
}

export function getAbsenceCancelButtonStyle(): CSSProperties {
  return cancelButtonStyle
}

export function getAbsenceConfirmButtonStyle(
  disabled: boolean
): CSSProperties {
  return {
    flex: 1,
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: disabled ? 'var(--bg-subtle)' : 'var(--accent)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-on-accent)',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
