import { buildDailySourceSyncRows } from '@/ui/reports/analysis-beta/services/report-source-cloud.service';

describe('report-source-cloud.service', () => {
  it('groups answered, abandoned, and transaction source rows by report date', () => {
    const rows = buildDailySourceSyncRows({
      userId: 'user-1',
      answeredCalls: [
        {
          id: 'ans-1',
          dst: '8090000001',
          agente: 'rafael',
          fecha: '2026-03-01',
          periodo: '09:00-09:29',
          hora: '09:10:00',
          llamadas: 5,
          conexion: 80,
          turno: 'Día',
        },
      ],
      rawAbandonedCalls: [
        {
          id: 'abn-1',
          telefono: '8090000002',
          fecha: '2026-03-01',
          hora: '09:20:00',
          conexion: 15,
          periodo: '09:00',
          turno: 'Día',
          disposition: 'ABANDON',
          isDuplicate: false,
          isLT20: true,
        },
      ],
      rawTransactions: [
        {
          id: 'trx-1',
          sucursal: 'Unicentro',
          agente: 'rafael',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Call center',
          plataformaCode: 'CC',
          fecha: '2026-03-01',
          hora: '09:22:00',
          estatus: 'N',
          valor: 1200,
        },
        {
          id: 'trx-2',
          sucursal: 'Churchill',
          agente: 'nicole',
          agenteTipo: 'agente',
          canalReal: 'CC',
          plataforma: 'Call center',
          plataformaCode: 'CC',
          fecha: '2026-03-02',
          hora: '10:00:00',
          estatus: 'N',
          valor: 900,
        },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        report_date: '2026-03-01',
        answered_calls: expect.arrayContaining([
          expect.objectContaining({ id: 'ans-1' }),
        ]),
        raw_abandoned_calls: expect.arrayContaining([
          expect.objectContaining({ id: 'abn-1' }),
        ]),
        raw_transactions: expect.arrayContaining([
          expect.objectContaining({ id: 'trx-1' }),
        ]),
      })
    );
    expect(rows[1]).toEqual(
      expect.objectContaining({
        report_date: '2026-03-02',
        answered_calls: [],
        raw_abandoned_calls: [],
        raw_transactions: expect.arrayContaining([
          expect.objectContaining({ id: 'trx-2' }),
        ]),
      })
    );
  });
});
