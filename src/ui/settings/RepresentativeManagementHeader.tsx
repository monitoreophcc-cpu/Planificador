'use client'

import { HelpPanel } from '../components/HelpPanel'

export function RepresentativeManagementHeader() {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2
        style={{
          margin: 0,
          marginBottom: '8px',
          fontSize: '20px',
          color: 'var(--text-main)',
        }}
      >
        Gestión de Representantes
      </h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Añade, edita o desactiva representantes. El orden determina el ranking del
          incentivo.
        </p>
        <HelpPanel
          title="¿Cómo agregar representantes?"
          points={[
            'Completa el formulario con nombre, rol y turno base',
            'Selecciona los días libres en el calendario semanal',
            'El representante aparecerá al final de su turno',
          ]}
        />
      </div>
    </div>
  )
}
