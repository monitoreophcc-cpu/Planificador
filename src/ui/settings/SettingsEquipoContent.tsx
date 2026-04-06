'use client'

import { CoverageRulesMatrix } from '../coverage/CoverageRulesMatrix'
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
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

      {activeEquipoSection === 'representatives' ? (
        <RepresentativeManagement />
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📉 Reglas de Demanda
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}
            >
              Configura la cobertura mínima requerida para cada turno y día.
            </p>
          </div>
          <CoverageRulesMatrix />
        </div>
      )}
    </div>
  )
}
