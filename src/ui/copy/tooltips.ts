// src/ui/copy/tooltips.ts

export const TOOLTIPS = {
  coverage: {
    title: 'Cobertura del turno',
    description: (active: number, planned: number) =>
      `${active} de ${planned} personas planificadas están presentes.`,
  },
  absence: {
    title: 'Ausencia registrada',
    description:
      'El colaborador no asistió. Esto impacta la cobertura y no se puede modificar desde la planificación.',
  },
  vacation: {
    title: 'Vacaciones',
    description:
      'Periodo de descanso. No se puede asignar trabajo durante estas fechas.',
  },
  license: {
    title: 'Licencia',
    description:
      'Ausencia justificada por causa médica o administrativa. No se puede modificar el plan.',
  },
  override: {
    title: 'Ajuste manual',
    description:
      'Este día fue cambiado manualmente y no sigue la planificación base. Haz clic para revertir.',
  },
  base: {
    title: 'Estado base',
    description:
      'Estado según el horario predefinido del representante. Haz clic para modificar.',
  },
  stats: {
    totalIncidents: 'Número total de eventos negativos registrados este mes (ausencias, tardanzas, errores).',
    totalDeductions: 'Suma de todos los puntos acumulados. Cada tipo de incidencia aporta un valor distinto.',
    absences: 'Cantidad de ausencias no justificadas. Es la incidencia de mayor impacto negativo.',
    peopleAtRisk: 'Número de representantes que conviene revisar porque superaron los umbrales de alerta definidos (por ejemplo, ≥3 tardanzas o ≥2 ausencias).',
  },
} as const
