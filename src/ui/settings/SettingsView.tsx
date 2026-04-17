'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useEditMode } from '@/hooks/useEditMode'
import { HolidayManagement } from './HolidayManagement'
import { Users, Calendar, Settings } from 'lucide-react'
import { useToast } from '../components/ToastProvider'
import {
  SettingsEquipoContent,
  type EquipoSection,
} from './SettingsEquipoContent'
import { SettingsSystemContent } from './SettingsSystemContent'
import { settingsViewStyles } from './settingsViewStyles'
import { UI_GLOSSARY } from '@/ui/copy/glossary'

type SettingsTab = 'equipo' | 'calendario' | 'sistema'

const SETTINGS_TAB_META: Record<
  SettingsTab,
  { title: string }
> = {
  equipo: {
    title: 'Equipo, reglas y perfiles',
  },
  calendario: {
    title: 'Feriados y excepciones del año',
  },
  sistema: {
    title: 'Respaldo, ayuda e historial',
  },
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sistema')
  const [activeEquipoSection, setActiveEquipoSection] = useState<EquipoSection>('representatives')

  const { mode, toggle } = useEditMode()
  const isAdvancedMode = mode === 'ADMIN_OVERRIDE'

  const { showToast } = useToast()
  const { resetState, showConfirm } = useAppStore(s => ({
    resetState: s.resetState,
    showConfirm: s.showConfirm,
  }))
  const activeTabMeta = SETTINGS_TAB_META[activeTab]

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: '⚠️ ¿Borrar cambios de la planificación?',
      description: (
        <>
          <p>
            Esta acción eliminará todas las incidencias y cambios manuales
            registrados en la planificación.
          </p>
          <p style={{ marginTop: '10px', fontWeight: 500 }}>
            Se conservarán las licencias y vacaciones ya registradas.
          </p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
            Esta acción no se puede deshacer.
          </p>
        </>
      ),
      intent: 'danger',
      confirmLabel: 'Sí, borrar cambios',
    })

    if (confirmed) {
      resetState(true)
      showToast({
        title: 'Cambios eliminados',
        message: 'Se borraron los cambios manuales de la planificación.',
        type: 'success'
      })
    }
  }

  return (
    <div style={settingsViewStyles.container}>
      <section style={settingsViewStyles.hero}>
        <div style={settingsViewStyles.heroCopy}>
          <h1 style={settingsViewStyles.heroTitle}>{UI_GLOSSARY.settingsSection}</h1>
          <p style={settingsViewStyles.heroContext}>
            {activeTabMeta.title}
          </p>
        </div>

        <div style={settingsViewStyles.tabRail} role="tablist" aria-label="Secciones de ajustes">
          <button
            style={settingsViewStyles.tab(activeTab === 'equipo')}
            onClick={() => setActiveTab('equipo')}
            aria-pressed={activeTab === 'equipo'}
          >
            <Users size={16} />
            Equipo y Reglas
          </button>
          <button
            style={settingsViewStyles.tab(activeTab === 'calendario')}
            onClick={() => setActiveTab('calendario')}
            aria-pressed={activeTab === 'calendario'}
          >
            <Calendar size={16} />
            Calendario
          </button>
          <button
            style={settingsViewStyles.tab(activeTab === 'sistema')}
            onClick={() => setActiveTab('sistema')}
            aria-pressed={activeTab === 'sistema'}
          >
            <Settings size={16} />
            Sistema
          </button>
        </div>
      </section>

      <div style={settingsViewStyles.contentSurface}>
        {activeTab === 'equipo' && (
          <SettingsEquipoContent
            activeEquipoSection={activeEquipoSection}
            onEquipoSectionChange={setActiveEquipoSection}
          />
        )}
        {activeTab === 'calendario' && <HolidayManagement />}

        {activeTab === 'sistema' && (
          <SettingsSystemContent
            handleReset={handleReset}
            isAdvancedMode={isAdvancedMode}
            toggleAdvancedMode={toggle}
          />
        )}
      </div>
    </div>
  )
}
