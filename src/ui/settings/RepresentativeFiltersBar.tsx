'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { ShiftType } from '@/domain/types'
import type {
  RepresentativeRoleFilter,
  RepresentativeStatusFilter,
} from './representativeManagementFilters'

interface RepresentativeFiltersBarProps {
  activeShift: ShiftType | 'ALL'
  hasActiveFilters: boolean
  resultCount: number
  roleFilter: RepresentativeRoleFilter
  searchQuery: string
  statusFilter: RepresentativeStatusFilter
  onClearFilters: () => void
  onRoleFilterChange: (value: RepresentativeRoleFilter) => void
  onSearchQueryChange: (value: string) => void
  onStatusFilterChange: (value: RepresentativeStatusFilter) => void
}

const roleOptions: Array<{
  label: string
  value: RepresentativeRoleFilter
}> = [
  { label: 'Todos los roles', value: 'ALL' },
  { label: 'Ventas', value: 'SALES' },
  { label: 'Servicio al Cliente', value: 'CUSTOMER_SERVICE' },
]

const statusOptions: Array<{
  label: string
  value: RepresentativeStatusFilter
}> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Inactivos', value: 'INACTIVE' },
]

function shiftLabel(activeShift: ShiftType | 'ALL'): string {
  switch (activeShift) {
    case 'DAY':
      return 'Turno Día'
    case 'NIGHT':
      return 'Turno Noche'
    default:
      return 'Todos los turnos'
  }
}

export function RepresentativeFiltersBar({
  activeShift,
  hasActiveFilters,
  resultCount,
  roleFilter,
  searchQuery,
  statusFilter,
  onClearFilters,
  onRoleFilterChange,
  onSearchQueryChange,
  onStatusFilterChange,
}: RepresentativeFiltersBarProps) {
  return (
    <section
      style={{
        borderRadius: '18px',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background:
          'linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 100%)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <SlidersHorizontal size={14} />
            Búsqueda y filtros
          </div>
          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: '56ch',
            }}
          >
            Busca por nombre o filtra por rol y estado. El turno visible se sigue
            controlando con la vista actual: <strong>{shiftLabel(activeShift)}</strong>.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              padding: '7px 10px',
              borderRadius: '999px',
              background: 'white',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {resultCount} resultado(s)
          </span>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.22)',
                background: 'white',
                color: '#475569',
                borderRadius: '999px',
                padding: '8px 12px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <X size={14} />
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'end',
        }}
      >
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: '1 1 260px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            Buscar representante
          </span>
          <span
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={event => onSearchQueryChange(event.target.value)}
              placeholder="Nombre, rol, turno o estado"
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                background: 'white',
                fontSize: '14px',
                color: 'var(--text-main)',
              }}
            />
          </span>
        </label>

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: '1 1 170px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            Rol
          </span>
          <select
            value={roleFilter}
            onChange={event =>
              onRoleFilterChange(event.target.value as RepresentativeRoleFilter)
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              background: 'white',
              fontSize: '14px',
              color: 'var(--text-main)',
            }}
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: '1 1 170px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            Estado
          </span>
          <select
            value={statusFilter}
            onChange={event =>
              onStatusFilterChange(event.target.value as RepresentativeStatusFilter)
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              background: 'white',
              fontSize: '14px',
              color: 'var(--text-main)',
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
