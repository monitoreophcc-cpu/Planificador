import type { CSSProperties } from 'react'

export const swapModalInputStyle: CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

export const swapModalLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
}

export function getSwapTypeColorStyles(
  color: 'blue' | 'green' | 'orange',
  isActive: boolean
) {
  if (!isActive) {
    return {
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      color: '#4b5563',
    }
  }

  switch (color) {
    case 'blue':
      return {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
        color: '#1d4ed8',
      }
    case 'green':
      return {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        color: '#15803d',
      }
    case 'orange':
      return {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa',
        color: '#c2410c',
      }
  }
}
