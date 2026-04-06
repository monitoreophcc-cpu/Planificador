'use client'

import { GuideAccordion } from './GuideAccordion'
import { quickGuideItems } from './quickGuideItems'

export function QuickGuide() {
  return (
    <section style={{ marginBottom: 'var(--space-xl)' }}>
      <h2
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-xs)',
          color: 'var(--text-main)',
        }}
      >
        Guía Rápida{' '}
        <span
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 400,
            color: 'var(--text-muted)',
          }}
        >
          (léela una vez)
        </span>
      </h2>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-md)',
          marginTop: 0,
        }}
      >
        Esta guía explica qué hace cada pantalla y qué se espera de ti. No
        necesitas aprender el sistema. Solo usarlo correctamente.
      </p>

      <GuideAccordion items={quickGuideItems} />
    </section>
  )
}
