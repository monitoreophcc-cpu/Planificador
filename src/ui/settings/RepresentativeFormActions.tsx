import { RotateCcw, Save, X } from 'lucide-react'
import { representativeFormStyles } from './representativeFormStyles'

interface RepresentativeFormActionsProps {
  canReset: boolean
  isDirty: boolean
  isEditing: boolean
  onCancel: () => void
  onReset: () => void
  submitDisabled: boolean
}

export function RepresentativeFormActions({
  canReset,
  isDirty,
  isEditing,
  onCancel,
  onReset,
  submitDisabled,
}: RepresentativeFormActionsProps) {
  return (
    <div style={representativeFormStyles.footer}>
      <button
        type="button"
        onClick={onCancel}
        style={representativeFormStyles.secondaryButton}
      >
        <X size={16} /> {isEditing ? 'Volver a la ficha' : 'Limpiar panel'}
      </button>
      {canReset ? (
        <button
          type="button"
          onClick={onReset}
          style={representativeFormStyles.secondaryButton}
        >
          <RotateCcw size={16} /> {isEditing ? 'Descartar cambios' : 'Reiniciar'}
        </button>
      ) : null}
      <button
        type="submit"
        disabled={submitDisabled}
        style={
          submitDisabled
            ? representativeFormStyles.submitButtonDisabled
            : representativeFormStyles.submitButton
        }
      >
        <Save size={16} />
        {isEditing ? (isDirty ? 'Guardar cambios' : 'Sin cambios') : 'Agregar'}
      </button>
    </div>
  )
}
