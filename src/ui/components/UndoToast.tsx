'use client'

import React from 'react'
import { useAppUiStore } from '@/store/useAppUiStore'

export function UndoToast() {
  const stack = useAppUiStore(s => s.undoStack)
  const executeUndo = useAppUiStore(s => s.executeUndo)

  if (stack.length === 0) {
    return null
  }

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 2000,
      }}
    >
      {stack.map(action => (
        <div
          key={action.id}
          style={{
            background: 'hsl(220, 20%, 15%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span>{action.label}</span>
          <button
            onClick={() => executeUndo(action.id)}
            style={{
              fontWeight: 600,
              color: 'hsl(200, 100%, 70%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            Deshacer
          </button>
        </div>
      ))}
    </div>
  )
}
