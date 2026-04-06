'use client'

import { useState } from 'react'
import { Moon, Plus, Sun, X } from 'lucide-react'
import { createBaseSchedule } from '@/domain/state'
import type {
  BaseSchedule,
  Representative,
  RepresentativeRole,
  ShiftType,
} from '@/domain/types'
import { RepresentativeDayScheduleSelector } from './RepresentativeDayScheduleSelector'

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
      style={{
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>
          {rep ? 'Editar Representante' : 'Nuevo Representante'}
        </h3>
        {rep && (
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

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '6px',
            color: 'var(--text-main)',
          }}
        >
          Nombre Completo
        </label>
        <input
          type="text"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Ej: Ana García"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            Rol
          </label>
          <select
            value={role}
            onChange={event => setRole(event.target.value as RepresentativeRole)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              background: 'var(--bg-panel)',
            }}
          >
            <option value="SALES">Ventas</option>
            <option value="CUSTOMER_SERVICE">Servicio al Cliente</option>
          </select>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            Turno Base
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setBaseShift('DAY')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                border: '1px solid',
                borderRadius: '6px',
                cursor: 'pointer',
                background: baseShift === 'DAY' ? '#fffbeb' : 'white',
                borderColor: baseShift === 'DAY' ? '#fcd34d' : '#d1d5db',
                color: baseShift === 'DAY' ? '#b45309' : '#374151',
              }}
            >
              <Sun size={16} /> Día
            </button>
            <button
              type="button"
              onClick={() => setBaseShift('NIGHT')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                border: '1px solid',
                borderRadius: '6px',
                cursor: 'pointer',
                background: baseShift === 'NIGHT' ? '#eef2ff' : 'white',
                borderColor: baseShift === 'NIGHT' ? '#c7d2fe' : '#d1d5db',
                color: baseShift === 'NIGHT' ? '#4338ca' : '#374151',
              }}
            >
              <Moon size={16} /> Noche
            </button>
          </div>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            Patrón base de mixto
          </label>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '8px',
              marginTop: 0,
            }}
          >
            Se usa solo como referencia cuando no hay ajustes temporales. Los cambios
            especiales se configuran en Horarios Especiales.
          </p>
          <select
            value={mixProfile}
            onChange={event =>
              setMixProfile(event.target.value as '' | 'WEEKDAY' | 'WEEKEND')
            }
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              background: 'var(--bg-panel)',
            }}
          >
            <option value="">Ninguno</option>
            <option value="WEEKDAY">Mixto entre semana (L-J) - base</option>
            <option value="WEEKEND">Mixto fin de semana (V-D) - base</option>
          </select>
        </div>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '6px',
            color: 'var(--text-main)',
          }}
        >
          Días Libres Base (semana)
        </label>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          Selecciona los días que el representante NO trabaja
        </p>
        <RepresentativeDayScheduleSelector
          schedule={baseSchedule}
          onChange={setBaseSchedule}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '8px',
        }}
      >
        <button
          type="submit"
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
          <Plus size={16} /> {rep ? 'Guardar Cambios' : 'Agregar'}
        </button>
      </div>
    </form>
  )
}
