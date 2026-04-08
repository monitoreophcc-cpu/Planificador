'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { HistoryEvent } from '@/domain/types'
import { useEditMode } from '@/hooks/useEditMode'
import { HolidayManagement } from './HolidayManagement'
import { Users, Calendar, Settings } from 'lucide-react'
import { useToast } from '../components/ToastProvider'
import { LogViewerModal } from '../components/LogViewerModal'
import {
  SettingsEquipoContent,
  type EquipoSection,
} from './SettingsEquipoContent'
import { SettingsSystemContent } from './SettingsSystemContent'
import { SettingsHistoryItem } from './SettingsHistoryItem'
import { settingsViewStyles } from './settingsViewStyles'

type SettingsTab = 'equipo' | 'calendario' | 'sistema'

const SETTINGS_TAB_META: Record<
  SettingsTab,
  { eyebrow: string; title: string; description: string }
> = {
  equipo: {
    eyebrow: 'Estructura operativa',
    title: 'Equipo, reglas y perfiles',
    description:
      'Gestiona representantes, demanda y la base operativa desde una vista más ordenada y con menos fricción.',
  },
  calendario: {
    eyebrow: 'Calendario maestro',
    title: 'Feriados y excepciones del año',
    description:
      'Mantén visibles los días que afectan vacaciones y reglas sin perderte entre listas largas.',
  },
  sistema: {
    eyebrow: 'Confianza del sistema',
    title: 'Respaldo, guía y control avanzado',
    description:
      'Todo lo relacionado con sync, backups, auditoría y recuperación reunido en una superficie más clara.',
  },
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sistema')
  const [activeEquipoSection, setActiveEquipoSection] = useState<EquipoSection>('representatives')

  const [showHistory, setShowHistory] = useState(false)
  const [showAudit, setShowAudit] = useState(false)

  const { mode, toggle } = useEditMode()
  const isAdvancedMode = mode === 'ADMIN_OVERRIDE'

  const { showToast } = useToast()
  const { resetState, showConfirm, historyEvents } = useAppStore(s => ({
    resetState: s.resetState,
    showConfirm: s.showConfirm,
    historyEvents: s.historyEvents || [],
  }))

  const sortedHistory = [...historyEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const activeTabMeta = SETTINGS_TAB_META[activeTab]

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: '⚠️ ¿Reiniciar la planificación?',
      description: (
        <>
          <p>
            Esta acción eliminará todas las incidencias y ajustes manuales
            (ausencias, tardanzas, cambios de turno, etc.).
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
      confirmLabel: 'Sí, reiniciar',
    })

    if (confirmed) {
      resetState(true)
      showToast({
        title: 'Planificación reiniciada',
        message: 'Se han eliminado los cambios manuales.',
        type: 'success'
      })
    }
  }

  return (
    <div style={settingsViewStyles.container}>
      <LogViewerModal
        title="Historial de Cambios"
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        items={sortedHistory}
        renderItem={(item: HistoryEvent) => <SettingsHistoryItem item={item} />}
        emptyMessage="No hay eventos en el historial reciente."
      />

      <section style={settingsViewStyles.hero}>
        <div>
          <div style={settingsViewStyles.heroBadge}>{activeTabMeta.eyebrow}</div>
          <h1 style={settingsViewStyles.heroTitle}>Configuración v2</h1>
          <p style={settingsViewStyles.heroDescription}>
            {activeTabMeta.description}
          </p>
        </div>

        <div style={settingsViewStyles.tabRail}>
          <button
            style={settingsViewStyles.tab(activeTab === 'equipo')}
            onClick={() => setActiveTab('equipo')}
          >
            <Users size={16} />
            Equipo y Reglas
          </button>
          <button
            style={settingsViewStyles.tab(activeTab === 'calendario')}
            onClick={() => setActiveTab('calendario')}
          >
            <Calendar size={16} />
            Calendario
          </button>
          <button
            style={settingsViewStyles.tab(activeTab === 'sistema')}
            onClick={() => setActiveTab('sistema')}
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
            onShowAuditChange={updater =>
              setShowAudit(previous => updater(previous))
            }
            onShowHistory={() => setShowHistory(true)}
            showAudit={showAudit}
            toggleAdvancedMode={toggle}
          />
        )}
      </div>
    </div>
  )
}
