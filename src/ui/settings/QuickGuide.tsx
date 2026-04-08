'use client'

import { GuideAccordion } from './GuideAccordion'
import { quickGuideItems } from './quickGuideItems'

export function QuickGuide() {
  return (
    <section
      style={{
        padding: '22px',
        borderRadius: '22px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(var(--accent-rgb), 0.04) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          marginBottom: '6px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}
      >
        Ayuda contextual
      </div>
      <h2
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
          marginBottom: 'var(--space-xs)',
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
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
          (leela una vez)
        </span>
      </h2>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-md)',
          marginTop: 0,
          lineHeight: 1.7,
          maxWidth: '68ch',
        }}
      >
        Esta guía explica qué hace cada pantalla y qué se espera de ti. No
        necesitas aprender el sistema. Solo usarlo correctamente.
      </p>

      <GuideAccordion items={quickGuideItems} />
    </section>
  )
}
