'use client'

import React, { ReactNode, useEffect, useId } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, X } from 'lucide-react'

type ConfirmIntent = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  intent?: ConfirmIntent
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  intent = 'info',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onCancel, open])

  if (!open) return null

  const colorMap: Record<
    ConfirmIntent,
    {
      badge: string
      badgeSurface: string
      borderColor: string
      icon: React.ReactNode
      eyebrow: string
      confirmStyle: React.CSSProperties
    }
  > = {
    danger: {
      badge: 'var(--danger)',
      badgeSurface: 'rgba(192, 85, 61, 0.12)',
      borderColor: 'var(--border-danger)',
      icon: <AlertCircle size={18} />,
      eyebrow: 'Accion delicada',
      confirmStyle: {
        background: 'linear-gradient(180deg, var(--danger) 0%, var(--text-danger) 170%)',
        color: 'var(--text-on-accent)',
        borderColor: 'rgba(192, 85, 61, 0.24)',
        boxShadow: '0 18px 30px rgba(192, 85, 61, 0.16)',
      },
    },
    warning: {
      badge: 'var(--warning)',
      badgeSurface: 'rgba(176, 108, 16, 0.12)',
      borderColor: 'var(--border-warning)',
      icon: <AlertTriangle size={18} />,
      eyebrow: 'Revision recomendada',
      confirmStyle: {
        background: 'linear-gradient(180deg, var(--warning) 0%, var(--text-warning) 170%)',
        color: 'var(--text-on-accent)',
        borderColor: 'rgba(176, 108, 16, 0.24)',
        boxShadow: '0 18px 30px rgba(176, 108, 16, 0.16)',
      },
    },
    info: {
      badge: 'var(--accent)',
      badgeSurface: 'rgba(var(--accent-rgb), 0.12)',
      borderColor: 'rgba(var(--accent-rgb), 0.18)',
      icon: <AlertTriangle size={18} />,
      eyebrow: 'Confirmacion',
      confirmStyle: {
        background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
        color: 'var(--text-on-accent)',
        borderColor: 'rgba(var(--accent-rgb), 0.22)',
        boxShadow: '0 18px 30px rgba(var(--accent-rgb), 0.16)',
      },
    },
  }
  const intentStyle = colorMap[intent]

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      'radial-gradient(circle at top, rgba(var(--accent-rgb), 0.16), transparent 30%), rgba(24, 34, 48, 0.42)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
  }

  const modalContentStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
    borderRadius: 'calc(var(--radius-card) + 4px)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-strong)',
    width: '100%',
    maxWidth: '34rem',
    overflow: 'hidden',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.8rem 1.1rem',
    borderRadius: '16px',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.92rem',
    minWidth: 120,
    transition: 'all 0.2s ease',
  }

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <motion.div
        style={modalContentStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <div style={{ padding: '1.6rem 1.6rem 1.55rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.95rem', minWidth: 0 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  color: intentStyle.badge,
                  background: intentStyle.badgeSurface,
                  border: `1px solid ${intentStyle.borderColor}`,
                  flexShrink: 0,
                }}
              >
                {intentStyle.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {intentStyle.eyebrow}
                </div>
                <h2
                  id={titleId}
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cerrar dialogo"
              style={{
                width: 38,
                height: 38,
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-raised)',
                color: 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
          {description && (
            <div
              id={descriptionId}
              style={{
                fontSize: '0.94rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                lineHeight: '1.7',
              }}
            >
              {description}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.65rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                ...buttonStyle,
                background: 'transparent',
                color: 'var(--text-muted)',
                borderColor: 'transparent',
                boxShadow: 'none',
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                ...buttonStyle,
                ...intentStyle.confirmStyle,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
