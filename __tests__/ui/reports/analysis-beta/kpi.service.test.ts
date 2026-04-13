import { buildMonthlyRepresentativeSnapshot } from '@/ui/reports/analysis-beta/services/kpi.service';

describe('buildMonthlyRepresentativeSnapshot', () => {
  it('accumulates only human representatives for the selected month', () => {
    const snapshot = buildMonthlyRepresentativeSnapshot(
      [
        {
          id: 't-1',
          sucursal: 'Unicentro',
          agente: 'rafael ramirez',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2026-03-01',
          hora: '09:10:00',
          estatus: 'N',
          valor: 1500,
        },
        {
          id: 't-2',
          sucursal: 'Unicentro',
          agente: 'rafael ramirez',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2026-03-02',
          hora: '10:15:00',
          estatus: 'N',
          valor: 900,
        },
        {
          id: 't-3',
          sucursal: 'Bella Vista',
          agente: 'nicole araujo',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2026-03-02',
          hora: '11:20:00',
          estatus: 'N',
          valor: 2000,
        },
        {
          id: 't-4',
          sucursal: 'Bella Vista',
          agente: 'WhatsApp',
          agenteTipo: 'plataforma',
          agenteCodigo: 'WA',
          canalReal: 'Delivery',
          plataforma: 'WhatsApp',
          plataformaCode: 'WA',
          fecha: '2026-03-03',
          hora: '11:30:00',
          estatus: 'N',
          valor: 500,
        },
        {
          id: 't-5',
          sucursal: 'Bella Vista',
          agente: 'rafael ramirez',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Monitoreo Call Center',
          plataformaCode: 'CC',
          fecha: '2026-04-01',
          hora: '12:30:00',
          estatus: 'N',
          valor: 1800,
        },
      ],
      '2026-03-20'
    );

    expect(snapshot).toEqual(
      expect.objectContaining({
        monthLabel: 'marzo de 2026',
        loadedDays: 3,
        expectedDays: 31,
      })
    );
    const rafael = snapshot?.rows.find((row) => row.agente === 'rafael ramirez');
    const nicole = snapshot?.rows.find((row) => row.agente === 'nicole araujo');

    expect(rafael).toEqual(
      expect.objectContaining({
        transacciones: 2,
      })
    );
    expect(rafael?.ventas).toBeCloseTo(1951.289304, 6);
    expect(rafael?.ticketPromedio).toBeCloseTo(975.644652, 6);

    expect(nicole).toEqual(
      expect.objectContaining({
        transacciones: 1,
      })
    );
    expect(nicole?.ventas).toBeCloseTo(1626.07442, 6);
    expect(nicole?.ticketPromedio).toBeCloseTo(1626.07442, 6);

    expect(snapshot?.rows.some((row) => row.agente === 'WhatsApp')).toBe(false);
  });
});
