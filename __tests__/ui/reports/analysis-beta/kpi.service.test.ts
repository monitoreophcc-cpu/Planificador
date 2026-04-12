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
    expect(snapshot?.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          agente: 'rafael ramirez',
          transacciones: 2,
          ventas: 2400,
          ticketPromedio: 1200,
        }),
        expect.objectContaining({
          agente: 'nicole araujo',
          transacciones: 1,
          ventas: 2000,
          ticketPromedio: 2000,
        }),
      ])
    );
    expect(snapshot?.rows.some((row) => row.agente === 'WhatsApp')).toBe(false);
  });
});
