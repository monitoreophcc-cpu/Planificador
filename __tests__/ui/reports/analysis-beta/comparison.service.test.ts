import {
  buildComparisonPeriodSummary,
  buildComparisonResult,
  buildComparisonSelectionOptions,
  resolveComparisonSelectionValue,
} from '@/ui/reports/analysis-beta/services/comparison.service';

describe('comparison.service', () => {
  it('builds weekly summaries anchored to the selected date even across years', () => {
    const summary = buildComparisonPeriodSummary({
      anchorDate: '2025-01-01',
      periodMode: 'week',
      loadedDates: ['2024-12-30', '2024-12-31', '2025-01-01', '2025-01-03'],
    });

    expect(summary).toEqual(
      expect.objectContaining({
        start: '2024-12-30',
        end: '2025-01-05',
        loadedDays: 4,
        expectedDays: 7,
        isComplete: false,
      })
    );
  });

  it('compares full months from different years and exposes loaded-day coverage', () => {
    const result = buildComparisonResult({
      config: {
        baseDate: '2025-03-12',
        targetDate: '2026-03-18',
        periodMode: 'month',
        shift: 'Día',
        startTime: '09:00',
        endTime: '23:30',
      },
      allAnswered: [
        {
          id: 'a-1',
          dst: '8090000001',
          agente: 'rafael',
          fecha: '2025-03-01',
          periodo: '09:00-09:29',
          hora: '09:10',
          llamadas: 5,
          conexion: 80,
          turno: 'Día',
        },
        {
          id: 'a-2',
          dst: '8090000002',
          agente: 'rafael',
          fecha: '2025-03-02',
          periodo: '09:00-09:29',
          hora: '09:20',
          llamadas: 4,
          conexion: 70,
          turno: 'Día',
        },
        {
          id: 'a-3',
          dst: '8090000003',
          agente: 'nicole',
          fecha: '2026-03-01',
          periodo: '09:00-09:29',
          hora: '09:15',
          llamadas: 6,
          conexion: 90,
          turno: 'Día',
        },
        {
          id: 'a-4',
          dst: '8090000004',
          agente: 'nicole',
          fecha: '2026-03-02',
          periodo: '09:00-09:29',
          hora: '09:25',
          llamadas: 7,
          conexion: 95,
          turno: 'Día',
        },
      ],
      allAbandoned: [],
      allTransactions: [
        {
          id: 't-1',
          sucursal: 'Unicentro',
          agente: 'rafael',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2025-03-01',
          hora: '09:12',
          estatus: 'N',
          valor: 900,
        },
        {
          id: 't-2',
          sucursal: 'Unicentro',
          agente: 'nicole',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2026-03-01',
          hora: '09:18',
          estatus: 'N',
          valor: 1200,
        },
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.basePeriod).toEqual(
      expect.objectContaining({
        label: 'marzo de 2025',
        start: '2025-03-01',
        end: '2025-03-31',
        loadedDays: 2,
        expectedDays: 31,
        isComplete: false,
      })
    );
    expect(result?.targetPeriod).toEqual(
      expect.objectContaining({
        label: 'marzo de 2026',
        start: '2026-03-01',
        end: '2026-03-31',
        loadedDays: 2,
        expectedDays: 31,
        isComplete: false,
      })
    );
  });

  it('builds explicit monthly options from loaded dates and resolves selections inside the same month', () => {
    const options = buildComparisonSelectionOptions({
      availableDates: [
        '2025-03-01',
        '2025-03-02',
        '2025-04-01',
        '2026-03-01',
      ],
      periodMode: 'month',
    });

    expect(options.map((option) => option.label)).toEqual([
      'marzo de 2026 · 1/31 dias',
      'abril de 2025 · 1/30 dias',
      'marzo de 2025 · 2/31 dias',
    ]);
    expect(
      resolveComparisonSelectionValue({
        selectedDate: '2025-03-02',
        options,
        periodMode: 'month',
      })
    ).toBe('2025-03-01');
  });
});
