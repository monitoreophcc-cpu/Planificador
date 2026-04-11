import type { GuideAccordionItem } from './GuideAccordion'

export const quickGuideItems: GuideAccordionItem[] = [
  {
    id: 'what-is',
    title: '¿Qué es Nexo?',
    content: (
      <>
        Nexo registra hechos reales y muestra su impacto.
        <br />
        <br />
        No predice.
        <br />
        No corrige decisiones.
        <br />
        No interpreta intenciones.
        <br />
        <br />
        Muestra datos tal como fueron registrados.
      </>
    ),
  },
  {
    id: 'daily-log',
    title: 'Registro Diario (uso principal)',
    content: (
      <>
        Aquí se registran hechos que ocurrieron HOY.
        <br />
        <br />
        <strong style={{ color: 'var(--text-main)' }}>Uso típico:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Selecciona a la persona.</li>
          <li>Selecciona el tipo de incidencia.</li>
          <li>Confirma el registro.</li>
        </ul>
        <strong style={{ color: 'var(--text-main)' }}>El sistema guarda:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Fecha y hora.</li>
          <li>Persona afectada.</li>
          <li>Tipo de incidencia.</li>
          <li>Impacto en cobertura (si aplica).</li>
        </ul>
        <strong style={{ color: 'var(--text-main)' }}>Correcciones rápidas</strong>
        <br />
        Al registrar una incidencia aparece <strong>Deshacer</strong> durante unos
        segundos.
        <br />
        Pasado ese tiempo, el registro queda fijo y solo puede corregirse usando
        Edición Avanzada.
      </>
    ),
  },
  {
    id: 'planning',
    title: 'Planificación (organizar el futuro)',
    content: (
      <>
        Aquí se define lo que debería ocurrir en días futuros.
        <br />
        <br />
        <strong style={{ color: 'var(--text-main)' }}>Se usa para:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Turnos.</li>
          <li>Vacaciones.</li>
          <li>Licencias.</li>
          <li>Cobertura esperada.</li>
        </ul>
        <strong style={{ color: 'var(--text-main)' }}>Reglas importantes:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Respeta feriados automáticamente.</li>
          <li>Calcula días laborables sin intervención manual.</li>
          <li>
            Indicadores rojos significan falta de personal, no errores del sistema.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'reports',
    title: 'Reportes (consulta y respaldo)',
    content: (
      <>
        Esta sección es solo de lectura.
        <br />
        <br />
        <strong style={{ color: 'var(--text-main)' }}>Se usa para:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Ver resúmenes mensuales.</li>
          <li>Consultar puntos e incidencias.</li>
          <li>Revisar historial.</li>
        </ul>
        Los datos aquí mostrados no se modifican.
        <br />
        Sirven como respaldo operativo y administrativo.
      </>
    ),
  },
  {
    id: 'advanced',
    title: 'Edición avanzada (uso excepcional)',
    content: (
      <>
        <strong style={{ color: '#ef4444' }}>Uso excepcional.</strong>
        <br />
        <br />
        <strong style={{ color: 'var(--text-main)' }}>Permite:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Corregir registros pasados.</li>
          <li>Ajustar información ya cerrada.</li>
        </ul>
        <strong style={{ color: 'var(--text-main)' }}>Reglas claras:</strong>
        <ul
          style={{
            paddingLeft: '1.2rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <li>Nada se elimina sin dejar rastro.</li>
          <li>Toda acción queda registrada.</li>
          <li>No es parte del trabajo diario.</li>
        </ul>
        Si no sabes si debes usarla, no la uses.
      </>
    ),
  },
]
