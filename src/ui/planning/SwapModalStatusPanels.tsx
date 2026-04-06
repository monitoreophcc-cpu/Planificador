import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { SwapEvent } from '@/domain/types'

type SwapModalStatusPanelsProps = {
  existingSwap?: SwapEvent
  existingSwapDescription: string
  previewText: ReactNode
  validationError: string | null
}

export function SwapModalStatusPanels({
  existingSwap,
  existingSwapDescription,
  previewText,
  validationError,
}: SwapModalStatusPanelsProps) {
  if (existingSwap) {
    return (
      <ExistingSwapSummary
        existingSwap={existingSwap}
        description={existingSwapDescription}
      />
    )
  }

  return (
    <>
      {previewText && !validationError && (
        <FeedbackBox
          icon={CheckCircle2}
          iconColor="#16a34a"
          backgroundColor="#f9fafb"
          borderColor="#e5e7eb"
          textColor="#374151"
        >
          {previewText}
        </FeedbackBox>
      )}

      {validationError && (
        <FeedbackBox
          icon={AlertTriangle}
          iconColor="#ef4444"
          backgroundColor="#fef2f2"
          borderColor="#fee2e2"
          textColor="#b91c1c"
        >
          {validationError}
        </FeedbackBox>
      )}
    </>
  )
}

function ExistingSwapSummary({
  existingSwap,
  description,
}: {
  existingSwap: SwapEvent
  description: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle
          size={24}
          color="#b45309"
          style={{ flexShrink: 0 }}
        />
        <div>
          <div style={{ fontWeight: 600, color: '#92400e' }}>
            Cambio de turno activo
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#78350f',
              marginTop: '4px',
            }}
          >
            {description}
          </div>
          {existingSwap.note && (
            <div
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                marginTop: '8px',
                color: '#78350f',
              }}
            >
              Nota: {existingSwap.note}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
        Si eliminas este cambio, la celda volvera a su estado original segun el
        plan base (WORKING u OFF).
      </div>
    </div>
  )
}

function FeedbackBox({
  icon: Icon,
  iconColor,
  backgroundColor,
  borderColor,
  textColor,
  children,
}: {
  icon: LucideIcon
  iconColor: string
  backgroundColor: string
  borderColor: string
  textColor: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <Icon
        color={iconColor}
        size={18}
        style={{ marginTop: '2px', flexShrink: 0 }}
      />
      <div
        style={{
          fontSize: '14px',
          color: textColor,
          lineHeight: '1.5',
          fontWeight: iconColor === '#ef4444' ? 500 : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
