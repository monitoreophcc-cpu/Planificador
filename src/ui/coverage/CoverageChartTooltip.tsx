'use client'

import React from 'react'
import { createPortal } from 'react-dom'

type CoverageChartTooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
}

export function CoverageChartTooltip({
  content,
  children,
}: CoverageChartTooltipProps) {
  const [show, setShow] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
    setShow(true)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      {show &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, calc(-100% - 8px))',
              background: '#1f2937',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              maxWidth: '240px',
              width: 'max-content',
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}
