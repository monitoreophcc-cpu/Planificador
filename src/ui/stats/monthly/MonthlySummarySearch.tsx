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
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '14px 16px',
        borderRadius: '18px',
        border: '1px solid rgba(202, 189, 168, 0.42)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,242,233,0.34) 100%)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <label
          htmlFor="monthly-summary-search"
          style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}
        >
          Filtrar ranking
        </label>
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Busca una persona sin abrir otro bloque de navegación.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginLeft: 'auto',
        }}
      >
        <input
          id="monthly-summary-search"
          type="text"
          placeholder="Nombre del representante"
          value={searchTerm}
          onChange={event => onSearchTermChange(event.target.value)}
          style={{
            width: 'min(100%, 300px)',
            minWidth: '220px',
            padding: '10px 14px',
            border: '1px solid rgba(202, 189, 168, 0.5)',
            borderRadius: '14px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            background: 'rgba(255,255,255,0.78)',
            color: 'var(--text-main)',
          }}
          onFocus={event => {
            event.target.style.borderColor = 'rgba(var(--accent-rgb), 0.38)'
          }}
          onBlur={event => {
            event.target.style.borderColor = 'rgba(202, 189, 168, 0.5)'
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(202, 189, 168, 0.42)',
            background: 'rgba(255,255,255,0.7)',
            color: 'var(--text-main)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {searchTerm
            ? `Mostrando ${filteredCount} de ${totalCount}`
            : `${totalCount} representantes`}
        </div>
      </div>
    </div>
  )
}
