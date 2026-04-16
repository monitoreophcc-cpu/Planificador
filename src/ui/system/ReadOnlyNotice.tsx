'use client'

type ReadOnlyNoticeProps = {
  title?: string
  description: string
}

export function ReadOnlyNotice({
  title = 'Modo solo lectura',
  description,
}: ReadOnlyNoticeProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '14px 16px',
        borderRadius: '18px',
        border: '1px solid rgba(217, 119, 6, 0.18)',
        background:
          'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, rgba(255,255,255,0.82) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#b45309',
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#92400e',
        }}
      >
        {description}
      </p>
    </section>
  )
}
