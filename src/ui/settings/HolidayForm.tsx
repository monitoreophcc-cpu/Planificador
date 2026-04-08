import { CalendarDays, PencilLine, Plus, X } from 'lucide-react'

type HolidayFormProps = {
  isEditing?: boolean
  newDate: string
  newLabel: string
  onCancel?: () => void
  onAdd: () => void
  onDateChange: (value: string) => void
  onLabelChange: (value: string) => void
}

export function HolidayForm({
  isEditing = false,
  newDate,
  newLabel,
  onCancel,
  onAdd,
  onDateChange,
  onLabelChange,
}: HolidayFormProps) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '20px',
        border: isEditing
          ? '1px solid rgba(124, 58, 237, 0.18)'
          : '1px solid rgba(15, 23, 42, 0.08)',
        background: isEditing
          ? 'linear-gradient(180deg, rgba(245,243,255,0.82) 0%, rgba(255,255,255,0.98) 24%)'
          : 'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 24%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '56ch' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isEditing ? '#7c3aed' : '#2563eb',
              marginBottom: '8px',
            }}
          >
            {isEditing ? <PencilLine size={14} /> : <CalendarDays size={14} />}
            {isEditing ? 'Edición de feriado' : 'Alta de feriado'}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: 'var(--text-main)',
            }}
          >
            {isEditing ? 'Ajusta el feriado seleccionado' : 'Agrega un feriado al calendario'}
          </h3>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            {isEditing
              ? 'Puedes corregir la fecha o el nombre. Al guardar, el calendario y los cálculos automáticos tomarán el cambio de inmediato.'
              : 'Los feriados se excluyen del cálculo de vacaciones y ayudan a que los reportes no cuenten días no laborables como días hábiles.'}
          </p>
        </div>

        {isEditing && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              background: 'white',
              color: '#475569',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <X size={15} />
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px',
              color: '#475569',
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
              padding: '10px 12px',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              borderRadius: '12px',
              fontSize: '14px',
              boxSizing: 'border-box',
              background: 'white',
              color: 'var(--text-main)',
            }}
          />
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px',
              color: '#475569',
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
              padding: '10px 12px',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              borderRadius: '12px',
              fontSize: '14px',
              boxSizing: 'border-box',
              background: 'white',
              color: 'var(--text-main)',
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') onAdd()
            }}
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          style={{
            padding: '10px 16px',
            background: isEditing ? '#7c3aed' : '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: isEditing
              ? '0 12px 24px rgba(124, 58, 237, 0.18)'
              : '0 12px 26px rgba(17, 24, 39, 0.18)',
          }}
        >
          {isEditing ? <PencilLine size={16} /> : <Plus size={16} />}
          {isEditing ? 'Guardar cambios' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
