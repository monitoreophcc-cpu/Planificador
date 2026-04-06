import type { ReactNode } from 'react'

export const statsOverviewTooltips: Record<string, ReactNode> = {
  totalIncidents:
    'Suma de todas las incidencias registradas, excluyendo Licencias y Vacaciones.',
  peopleAtRisk: (
    <div style={{ maxWidth: '250px', lineHeight: 1.4 }}>
      Cantidad de personas que superaron los límites definidos:
      <ul style={{ paddingLeft: '20px', margin: '4px 0 0' }}>
        <li>≥ 3 tardanzas</li>
        <li>≥ 2 errores</li>
        <li>≥ 2 ausencias</li>
        <li>o ≥ 10 puntos acumulados</li>
      </ul>
    </div>
  ),
  deficitDays:
    'Número de días del mes en los que hubo un déficit de cobertura en al menos un turno.',
  totalSwaps:
    'Cantidad total de cambios de turno (Covers, Swaps, Doubles) realizados en el mes.',
  licenses: 'Cantidad de eventos de licencia médica/especial iniciados este mes.',
  vacations: 'Cantidad de periodos de vacaciones iniciados este mes.',
}
