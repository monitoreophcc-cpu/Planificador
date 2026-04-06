'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'

export type GuideAccordionItem = {
  id: string
  title: string
  content: ReactNode
}

type GuideAccordionProps = {
  items: GuideAccordionItem[]
  defaultOpenId?: string | null
}

export function GuideAccordion({
  items,
  defaultOpenId = 'what-is',
}: GuideAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId)

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
    >
      {items.map(item => {
        const isOpen = openId === item.id

        return (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {item.title}
              <span style={{ color: 'var(--text-muted)' }}>
                {isOpen ? '−' : '+'}
              </span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div
                    style={{
                      padding: '0 var(--space-md) var(--space-md)',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
