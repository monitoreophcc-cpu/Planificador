'use client'

import { motion } from 'framer-motion'

type PersonDetailModalShellProps = {
  children: React.ReactNode
  onClose: () => void
}

export function PersonDetailModalShell({
  children,
  onClose,
}: PersonDetailModalShellProps) {
  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 50,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          tabIndex={-1}
          style={{
            outline: 'none',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '700px',
            maxWidth: '90vw',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={event => event.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}
