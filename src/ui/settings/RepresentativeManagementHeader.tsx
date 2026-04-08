'use client'

import { Moon, Plus, Sun, Users2 } from 'lucide-react'
import { HelpPanel } from '../components/HelpPanel'

interface RepresentativeManagementHeaderProps {
  activeRepsCount: number
  dayRepsCount: number
  inactiveRepsCount: number
  isEditing: boolean
  nightRepsCount: number
  onCreateNew: () => void
}

export function RepresentativeManagementHeader({
  activeRepsCount,
  dayRepsCount,
  inactiveRepsCount,
  isEditing,
  nightRepsCount,
  onCreateNew,
}: RepresentativeManagementHeaderProps) {
  const statItems = [
    {
      label: 'Activos',
      value: activeRepsCount,
      icon: Users2,
      accent: '#0f766e',
      background: 'rgba(240, 253, 250, 0.96)',
      border: 'rgba(13, 148, 136, 0.18)',
    },
    {
      label: 'Día',
      value: dayRepsCount,
      icon: Sun,
      accent: '#b45309',
      background: 'rgba(255, 251, 235, 0.96)',
      border: 'rgba(245, 158, 11, 0.22)',
    },
    {
      label: 'Noche',
      value: nightRepsCount,
      icon: Moon,
      accent: '#4338ca',
      background: 'rgba(238, 242, 255, 0.96)',
      border: 'rgba(99, 102, 241, 0.18)',
    },
  ]

  return (
    <section
      style={{
        borderRadius: '22px',
        padding: '22px 24px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 52%, rgba(239,246,255,0.9) 100%)',
        boxShadow: '0 18px 44px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
              marginBottom: '10px',
            }}
          >
            Workspace del equipo
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              lineHeight: 1.1,
              color: 'var(--text-main)',
            }}
          >
            Gestión de Representantes
          </h2>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: '62ch',
            }}
          >
            Ahora la gestión se organiza con una lista maestra limpia y ventanas
            emergentes para crear, editar y revisar fichas sin cruzar scrolls ni perder
            el contexto.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onCreateNew}
            style={{
              border: 'none',
              background: '#111827',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 12px 26px rgba(17, 24, 39, 0.18)',
            }}
          >
            <Plus size={16} />
            {isEditing ? 'Crear otro representante' : 'Nuevo representante'}
          </button>

          <HelpPanel
            title="¿Cómo agregar representantes?"
            points={[
              'Usa la lista para buscar y ubicar rápido al representante correcto',
              'Abre la ventana emergente para crear o editar sin perseguir el formulario',
              'Desde la ficha también puedes gestionar horarios especiales y acciones clave',
            ]}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '18px',
        }}
      >
        {statItems.map(item => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              style={{
                borderRadius: '16px',
                border: `1px solid ${item.border}`,
                background: item.background,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.88)',
                  color: item.accent,
                  border: `1px solid ${item.border}`,
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '1.12rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          )
        })}

        <div
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'rgba(248, 250, 252, 0.92)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >
            Inactivos
          </div>
          <div
            style={{
              fontSize: '1.12rem',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            {inactiveRepsCount}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Se mantienen fuera de la operación diaria.
          </div>
        </div>
      </div>
    </section>
  )
}
