import { Plus } from 'lucide-react'

type HolidayFormProps = {
  newDate: string
  newLabel: string
  onAdd: () => void
  onDateChange: (value: string) => void
  onLabelChange: (value: string) => void
}

export function HolidayForm({
  newDate,
  newLabel,
  onAdd,
  onDateChange,
  onLabelChange,
}: HolidayFormProps) {
  return (
    <div
      style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>
        Agregar Feriado
      </h3>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: '0 0 160px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            Fecha
          </label>
          <input
            type="date"
            value={newDate}
            onChange={event => onDateChange(event.target.value)}
            aria-label="Fecha del feriado"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            Nombre del Feriado
          </label>
          <input
            type="text"
            value={newLabel}
            onChange={event => onLabelChange(event.target.value)}
            placeholder="Ej: Día de la Independencia"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') onAdd()
            }}
          />
        </div>
        <button
          onClick={onAdd}
          style={{
            padding: '8px 16px',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
    </div>
  )
}
