import type { RepresentativeRole } from '@/domain/types'
import { representativeFormStyles } from './representativeFormStyles'

interface RepresentativeRoleFieldProps {
  role: RepresentativeRole
  onChange: (role: RepresentativeRole) => void
}

export function RepresentativeRoleField({
  role,
  onChange,
}: RepresentativeRoleFieldProps) {
  return (
    <div>
      <label style={representativeFormStyles.sectionTitle}>Rol</label>
      <select
        value={role}
        onChange={event => onChange(event.target.value as RepresentativeRole)}
        style={representativeFormStyles.select}
      >
        <option value="SALES">Ventas</option>
        <option value="CUSTOMER_SERVICE">Servicio al Cliente</option>
      </select>
    </div>
  )
}
