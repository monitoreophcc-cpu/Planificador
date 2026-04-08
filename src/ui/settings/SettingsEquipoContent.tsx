'use client'

import { DemandRulesManagement } from './DemandRulesManagement'
import { RepresentativeManagement } from './RepresentativeManagement'
import { settingsViewStyles } from './settingsViewStyles'

export type EquipoSection = 'representatives' | 'demand'

type SettingsEquipoContentProps = {
  activeEquipoSection: EquipoSection
  onEquipoSectionChange: (section: EquipoSection) => void
}

export function SettingsEquipoContent({
  activeEquipoSection,
  onEquipoSectionChange,
}: SettingsEquipoContentProps) {
  const sectionCopy =
    activeEquipoSection === 'representatives'
      ? 'Organiza el equipo operativo desde una lista maestra clara y trabaja cada ficha en ventanas emergentes mucho más enfocadas.'
      : 'Define la cobertura mínima con un workspace propio, contexto visible y una matriz que distingue lo explícito de lo heredado.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
              marginBottom: '8px',
            }}
          >
            Configuración operativa
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.28rem',
              color: 'var(--text-main)',
            }}
          >
            Equipo y Reglas
          </h2>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: '62ch',
            }}
          >
            {sectionCopy}
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            gap: '8px',
            padding: '6px',
            width: 'fit-content',
            borderRadius: '999px',
            background: 'rgba(241, 245, 249, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
          }}
        >
          <button
            style={settingsViewStyles.subTab(
              activeEquipoSection === 'representatives'
            )}
            onClick={() => onEquipoSectionChange('representatives')}
          >
            Gestión de Representantes
          </button>
          <button
            style={settingsViewStyles.subTab(activeEquipoSection === 'demand')}
            onClick={() => onEquipoSectionChange('demand')}
          >
            Reglas de Demanda
          </button>
        </div>
      </section>

      {activeEquipoSection === 'representatives' ? (
        <RepresentativeManagement />
      ) : (
        <DemandRulesManagement />
      )}
    </div>
  )
}
