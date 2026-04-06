'use client'

import React, { useState } from 'react'

function AbsenceSelector({
  onConfirm,
  onCancel,
}: {
  onConfirm: (value: boolean) => void
  onCancel: () => void
}) {
  const [justified, setJustified] = useState<boolean | null>(null)

  return (
    <>
      <div
        style={{
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #e5e7eb',
          background: '#f9fafb',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '12px',
            color: '#111827',
            textAlign: 'center',
          }}
        >
          ¿La ausencia es justificada?
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setJustified(true)}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '8px',
              border:
                justified === true
                  ? '2px solid #16a34a'
                  : '1px solid #d1d5db',
              background: justified === true ? '#dcfce7' : 'white',
              color: justified === true ? '#166534' : '#374151',
              cursor: 'pointer',
            }}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => setJustified(false)}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '8px',
              border:
                justified === false
                  ? '2px solid #dc2626'
                  : '1px solid #d1d5db',
              background: justified === false ? '#fee2e2' : 'white',
              color: justified === false ? '#991b1b' : '#374151',
              cursor: 'pointer',
            }}
          >
            No
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={justified === null}
          onClick={() => {
            if (justified !== null) {
              onConfirm(justified)
            }
          }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: justified === null ? '#d1d5db' : '#111827',
            color: 'white',
            fontWeight: 700,
            cursor: justified === null ? 'not-allowed' : 'pointer',
          }}
        >
          Confirmar
        </button>
      </div>
    </>
  )
}

type AbsenceConfirmationModalProps = {
  representativeName: string
  onConfirm: (isJustified: boolean) => void
  onCancel: () => void
}

export function AbsenceConfirmationModal({
  representativeName,
  onConfirm,
  onCancel,
}: AbsenceConfirmationModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <header>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Confirmar Ausencia
          </h3>
        </header>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#374151', margin: 0 }}>
            ¿Registrar <strong>Ausencia</strong> a
          </p>
          <p
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#111827',
              margin: '4px 0 0',
            }}
          >
            {representativeName}
          </p>
        </div>

        <AbsenceSelector onConfirm={onConfirm} onCancel={onCancel} />
      </div>
    </div>
  )
}
