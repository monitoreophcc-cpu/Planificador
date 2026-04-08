import { X } from 'lucide-react'

interface RepresentativeFormHeaderProps {
  isEditing: boolean
  isDirty: boolean
  repName?: string
  onCancel: () => void
}

export function RepresentativeFormHeader({
  isEditing,
  isDirty,
  repName,
  onCancel,
}: RepresentativeFormHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>
          {isEditing ? 'Edicion de ficha' : 'Alta de representante'}
        </h3>
        <div
          style={{
            fontSize: '12px',
            color: isDirty ? '#7c3aed' : 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          {isEditing
            ? `${repName ?? 'Esta ficha'} ${isDirty ? 'tiene cambios pendientes' : 'esta lista para revisar o guardar'}`
            : isDirty
              ? 'Hay cambios listos para guardarse en la nueva ficha'
              : 'Completa solo los datos base que necesites para empezar'}
        </div>
      </div>
      {isEditing && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
