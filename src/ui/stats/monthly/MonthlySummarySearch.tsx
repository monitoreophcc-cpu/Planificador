'use client'

interface MonthlySummarySearchProps {
  searchTerm: string
  totalCount: number
  filteredCount: number
  onSearchTermChange: (value: string) => void
}

export function MonthlySummarySearch({
  searchTerm,
  totalCount,
  filteredCount,
  onSearchTermChange,
}: MonthlySummarySearchProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: '20px',
        border: '1px solid var(--shell-border)',
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, rgba(255,255,255,0.42) 100%)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <label
        htmlFor="monthly-summary-search"
        style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}
      >
        Buscar Representante
      </label>
      <input
        id="monthly-summary-search"
        type="text"
        placeholder="Escribe el nombre del representante..."
        value={searchTerm}
        onChange={event => onSearchTermChange(event.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '1px solid var(--shell-border)',
          borderRadius: '16px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
          background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-veil) 100%)',
          color: 'var(--text-main)',
        }}
        onFocus={event => {
          event.target.style.borderColor = 'rgba(var(--accent-rgb), 0.38)'
        }}
        onBlur={event => {
          event.target.style.borderColor = 'var(--shell-border)'
        }}
      />
      {searchTerm && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Mostrando {filteredCount} de {totalCount} representantes
        </div>
      )}
    </div>
  )
}
