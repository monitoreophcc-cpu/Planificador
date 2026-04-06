'use client'

import { useState } from 'react'
import type {
  ISODate,
  Representative,
  ShiftType,
} from '@/domain/types'
import type { CoverageCreationForm } from '@/application/ui-models/coverageViewModels'
import type { Coverage } from '@/domain/planning/coverage'
import { useAppStore } from '@/store/useAppStore'
import { useCoverageStore } from '@/store/useCoverageStore'

type CoverageCreationFormComponentProps = {
  initialDate?: ISODate
  initialShift?: ShiftType
  onClose: () => void
  onSave?: (coverage: Coverage) => void
}

export function CoverageCreationFormComponent({
  initialDate,
  initialShift,
  onClose,
  onSave,
}: CoverageCreationFormComponentProps) {
  const { createCoverage } = useCoverageStore()
  const representatives = useAppStore(state => state.representatives)

  const [formData, setFormData] = useState<CoverageCreationForm>({
    date: initialDate || '',
    shift: initialShift || 'DAY',
    coveredRepId: '',
    coveringRepId: '',
    note: '',
  })

  const coveredRep = representatives.find(
    representative => representative.id === formData.coveredRepId
  )
  const coveringRep = representatives.find(
    representative => representative.id === formData.coveringRepId
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const coverage = createCoverage({
      date: formData.date,
      shift: formData.shift,
      coveredRepId: formData.coveredRepId,
      coveringRepId: formData.coveringRepId,
      note: formData.note,
    })

    onSave?.(coverage)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="coverage-form">
      <div className="form-group">
        <label>Fecha</label>
        <input
          type="date"
          value={formData.date}
          onChange={event =>
            setFormData({ ...formData, date: event.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Turno</label>
        <select
          value={formData.shift}
          onChange={event =>
            setFormData({
              ...formData,
              shift: event.target.value as ShiftType,
            })
          }
          required
        >
          <option value="DAY">Día</option>
          <option value="NIGHT">Noche</option>
        </select>
      </div>

      <RepresentativeSelect
        label="Quién necesita cobertura"
        representatives={representatives}
        value={formData.coveredRepId}
        onChange={value => setFormData({ ...formData, coveredRepId: value })}
      />

      <RepresentativeSelect
        label="Quién va a cubrir"
        representatives={representatives.filter(
          representative => representative.id !== formData.coveredRepId
        )}
        value={formData.coveringRepId}
        onChange={value => setFormData({ ...formData, coveringRepId: value })}
      />

      <div className="form-group">
        <label>Nota (opcional)</label>
        <textarea
          value={formData.note}
          onChange={event =>
            setFormData({ ...formData, note: event.target.value })
          }
          rows={3}
        />
      </div>

      {coveredRep && coveringRep && (
        <div className="coverage-preview">
          <p>
            <strong>Preview:</strong> {coveringRep.name} cubrirá el turno{' '}
            {formData.shift === 'DAY' ? 'Día' : 'Noche'} de {coveredRep.name}.
          </p>
          <p className="text-muted">
            Este cambio no altera turnos ni ausencias.
          </p>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Crear Cobertura
        </button>
      </div>
    </form>
  )
}

function RepresentativeSelect({
  label,
  onChange,
  representatives,
  value,
}: {
  label: string
  onChange: (value: string) => void
  representatives: Representative[]
  value: string
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select value={value} onChange={event => onChange(event.target.value)} required>
        <option value="">Seleccionar...</option>
        {representatives.map(representative => (
          <option key={representative.id} value={representative.id}>
            {representative.name}
          </option>
        ))}
      </select>
    </div>
  )
}
