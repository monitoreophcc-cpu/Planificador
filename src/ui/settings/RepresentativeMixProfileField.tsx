import { representativeFormStyles } from './representativeFormStyles'

interface RepresentativeMixProfileFieldProps {
  mixProfile: '' | 'WEEKDAY' | 'WEEKEND'
  onChange: (mixProfile: '' | 'WEEKDAY' | 'WEEKEND') => void
}

export function RepresentativeMixProfileField({
  mixProfile,
  onChange,
}: RepresentativeMixProfileFieldProps) {
  return (
    <div>
      <label style={representativeFormStyles.sectionTitle}>
        Patrón base de mixto
      </label>
      <p style={representativeFormStyles.helperText}>
        Se usa solo como referencia cuando no hay ajustes temporales. Los
        cambios especiales se configuran en Horarios Especiales.
      </p>
      <select
        value={mixProfile}
        onChange={event =>
          onChange(event.target.value as '' | 'WEEKDAY' | 'WEEKEND')
        }
        style={representativeFormStyles.select}
      >
        <option value="">Ninguno</option>
        <option value="WEEKDAY">Mixto entre semana (L-J) - base</option>
        <option value="WEEKEND">Mixto fin de semana (V-D) - base</option>
      </select>
    </div>
  )
}
