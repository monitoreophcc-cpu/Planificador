'use client'

import type { ReactNode } from 'react'
import { FileText, Printer } from 'lucide-react'

type ReportExportActionsProps = {
  disabled?: boolean
  isExportingPdf?: boolean
  onExportPdf: () => void | Promise<void>
  onPrint: () => void
  children?: ReactNode
  pdfLabel?: string
  printLabel?: string
}

const actionButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  padding: '10px 14px',
  background:
    'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
  border: '1px solid var(--shell-border)',
  borderRadius: '16px',
  cursor: 'pointer',
  fontWeight: 700,
  color: 'var(--text-main)',
  boxShadow: 'var(--shadow-sm)',
} as const

export function ReportExportActions({
  disabled = false,
  isExportingPdf = false,
  onExportPdf,
  onPrint,
  children,
  pdfLabel = 'Descargar PDF',
  printLabel = 'Imprimir',
}: ReportExportActionsProps) {
  const sharedDisabled = disabled || isExportingPdf

  return (
    <div
      className="report-screen-only"
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={onExportPdf}
        disabled={sharedDisabled}
        style={{
          ...actionButtonStyle,
          cursor: sharedDisabled ? 'wait' : 'pointer',
          opacity: sharedDisabled ? 0.72 : 1,
        }}
        title={pdfLabel}
      >
        <FileText size={16} />
        {isExportingPdf ? 'Generando PDF...' : pdfLabel}
      </button>

      <button
        type="button"
        onClick={onPrint}
        disabled={disabled}
        style={{
          ...actionButtonStyle,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.72 : 1,
        }}
        title={printLabel}
      >
        <Printer size={16} />
        {printLabel}
      </button>

      {children}
    </div>
  )
}
