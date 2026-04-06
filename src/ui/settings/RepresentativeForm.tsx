'use client'

import { useState } from 'react'
import { createBaseSchedule } from '@/domain/state'
import type {
  BaseSchedule,
  Representative,
  RepresentativeRole,
  ShiftType,
} from '@/domain/types'
import { RepresentativeDayScheduleSelector } from './RepresentativeDayScheduleSelector'
import { RepresentativeFormActions } from './RepresentativeFormActions'
import { RepresentativeFormHeader } from './RepresentativeFormHeader'
import { RepresentativeMixProfileField } from './RepresentativeMixProfileField'
import { RepresentativeRoleField } from './RepresentativeRoleField'
import { RepresentativeShiftSelector } from './RepresentativeShiftSelector'
import { representativeFormStyles } from './representativeFormStyles'

export type RepresentativeDraft = Omit<
  Representative,
  'id' | 'isActive' | 'orderIndex'
>

interface RepresentativeFormProps {
  rep?: Representative
  onSave: (data: RepresentativeDraft, id?: string) => void
  onCancel: () => void
}

export function RepresentativeForm({
  rep,
  onSave,
  onCancel,
}: RepresentativeFormProps) {
  const [name, setName] = useState(rep?.name || '')
  const [baseShift, setBaseShift] = useState<ShiftType>(rep?.baseShift || 'DAY')
  const [role, setRole] = useState<RepresentativeRole>(rep?.role || 'SALES')
  const [baseSchedule, setBaseSchedule] = useState<BaseSchedule>(
    rep?.baseSchedule || createBaseSchedule([1])
  )
  const [mixProfile, setMixProfile] = useState<'' | 'WEEKDAY' | 'WEEKEND'>(
    rep?.mixProfile?.type || ''
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }

    const data: RepresentativeDraft = {
      name,
      baseShift,
      role,
      baseSchedule,
      mixProfile: mixProfile ? { type: mixProfile } : undefined,
    }

    onSave(data, rep?.id)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={representativeFormStyles.form}
    >
      <RepresentativeFormHeader
        isEditing={Boolean(rep)}
        onCancel={onCancel}
      />

      <div>
        <label style={representativeFormStyles.sectionTitle}>
          Nombre Completo
        </label>
        <input
          type="text"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Ej: Ana García"
          style={representativeFormStyles.input}
          required
        />
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}
      >
        <RepresentativeRoleField role={role} onChange={setRole} />
        <RepresentativeShiftSelector
          baseShift={baseShift}
          onChange={setBaseShift}
        />
        <RepresentativeMixProfileField
          mixProfile={mixProfile}
          onChange={setMixProfile}
        />
      </div>

      <div>
        <label style={representativeFormStyles.sectionTitle}>
          Días Libres Base (semana)
        </label>
        <p style={representativeFormStyles.helperText}>
          Selecciona los días que el representante NO trabaja
        </p>
        <RepresentativeDayScheduleSelector
          schedule={baseSchedule}
          onChange={setBaseSchedule}
        />
      </div>

      <RepresentativeFormActions isEditing={Boolean(rep)} />
    </form>
  )
}
