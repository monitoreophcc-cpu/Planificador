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
          borderRadius: '24px',
          border: '1px solid var(--shell-border)',
          background:
            'linear-gradient(135deg, var(--surface-raised) 0%, var(--surface-tint) 58%, rgba(var(--accent-rgb), 0.08) 100%)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <div style={settingsViewStyles.sectionEyebrow}>Configuración operativa</div>
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
            background: 'var(--surface-tint)',
            border: '1px solid var(--shell-border)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)',
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
