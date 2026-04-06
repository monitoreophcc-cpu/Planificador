import type { CSSProperties } from 'react'
import type { EditMode } from '@/hooks/useEditMode'
import type { SwapEvent } from '@/domain/types'

type SwapModalFooterProps = {
  existingSwap?: SwapEvent
  mode: EditMode
  canSubmit: boolean
  onClose: () => void
  onConfirm: () => void
  onDelete: () => void
}

const footerStyle: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #f3f4f6',
  backgroundColor: '#f9fafb',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export function SwapModalFooter({
  existingSwap,
  mode,
  canSubmit,
  onClose,
  onConfirm,
  onDelete,
}: SwapModalFooterProps) {
  return (
    <div style={footerStyle}>
      {existingSwap ? (
        <>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Esta accion no se puede deshacer.
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#4b5563',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            {mode === 'ADMIN_OVERRIDE' && (
              <button
                onClick={onDelete}
                style={{
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Eliminar Cambio
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Los cambios afectan solo a este dia.
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#4b5563',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!canSubmit}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                backgroundColor: canSubmit ? '#2563eb' : '#d1d5db',
                border: 'none',
                borderRadius: '8px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit
                  ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  : 'none',
                transition: 'all 0.2s',
              }}
            >
              Confirmar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
