import { X } from 'lucide-react'

interface RepresentativeFormHeaderProps {
  isEditing: boolean
  onCancel: () => void
}

export function RepresentativeFormHeader({
  isEditing,
  onCancel,
}: RepresentativeFormHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>
        {isEditing ? 'Editar Representante' : 'Nuevo Representante'}
      </h3>
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
