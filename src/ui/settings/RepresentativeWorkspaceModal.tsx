'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

type RepresentativeWorkspaceModalProps = {
  children: React.ReactNode
  maxWidth?: number
  onClose: () => void
}

export function RepresentativeWorkspaceModal({
  children,
  maxWidth = 920,
  onClose,
}: RepresentativeWorkspaceModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <>
      <motion.div
        key="representative-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.48)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
        }}
      />

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1101,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <motion.div
          onClick={event => event.stopPropagation()}
          key="representative-modal-content"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth,
            maxHeight: '90vh',
            borderRadius: '24px',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(255,255,255,0.99) 20%)',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.24)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'rgba(255,255,255,0.9)',
              color: '#475569',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </>
  )
}
