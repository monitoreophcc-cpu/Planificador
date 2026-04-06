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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label
        htmlFor="monthly-summary-search"
        style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}
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
          padding: '10px 14px',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={event => {
          event.target.style.borderColor = '#2563eb'
        }}
        onBlur={event => {
          event.target.style.borderColor = '#d1d5db'
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
