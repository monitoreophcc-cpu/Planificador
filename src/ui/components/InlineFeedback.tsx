'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

type Props = {
  message?: string
  type?: 'error' | 'success' | 'warning'
}

export function InlineFeedback({ message, type = 'error' }: Props) {
  if (!message) return null

  const styles = {
    error: {
      label: 'Error',
      backgroundColor: 'var(--bg-danger)',
      color: 'var(--text-danger)',
      border: '1px solid var(--border-danger)',
      iconSurface: 'rgba(192, 85, 61, 0.12)',
    },
    success: {
      label: 'Listo',
      backgroundColor: 'var(--bg-success)',
      color: 'var(--text-success)',
      border: '1px solid var(--border-success)',
      iconSurface: 'rgba(47, 125, 96, 0.12)',
    },
    warning: {
      label: 'Cuidado',
      backgroundColor: 'var(--bg-warning)',
      color: 'var(--text-warning)',
      border: '1px solid var(--border-warning)',
      iconSurface: 'rgba(176, 108, 16, 0.12)',
    },
  }

  const Icon =
    type === 'error'
      ? AlertTriangle
      : type === 'success'
        ? CheckCircle
        : Info

  const selectedStyle = styles[type]

  return (
    <AnimatePresence>
      <motion.div
        role={type === 'success' ? 'status' : 'alert'}
        aria-live="polite"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          borderRadius: '18px',
          padding: '13px 14px',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)',
          backdropFilter: 'blur(10px)',
          ...selectedStyle,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '11px',
            display: 'grid',
            placeItems: 'center',
            background: selectedStyle.iconSurface,
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              marginBottom: 3,
            }}
          >
            {selectedStyle.label}
          </div>
          <span style={{ lineHeight: 1.6 }}>{message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
