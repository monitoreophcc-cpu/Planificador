import { Plus } from 'lucide-react'
import { representativeFormStyles } from './representativeFormStyles'

interface RepresentativeFormActionsProps {
  isEditing: boolean
}

export function RepresentativeFormActions({
  isEditing,
}: RepresentativeFormActionsProps) {
  return (
    <div style={representativeFormStyles.footer}>
      <button type="submit" style={representativeFormStyles.submitButton}>
        <Plus size={16} /> {isEditing ? 'Guardar Cambios' : 'Agregar'}
      </button>
    </div>
  )
}
