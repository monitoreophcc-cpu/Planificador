import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import {
  parseLegacyBiffBuffer,
  processTransactions,
} from '@/ui/reports/analysis-beta/services/parser.service';

function readFixture(name: string): Uint8Array {
  const absolutePath = join(
    process.cwd(),
    'docs',
    'callcenter-analytics-app-main',
    'docs',
    name
  );

  return new Uint8Array(readFileSync(absolutePath));
}

describe('parseLegacyBiffBuffer', () => {
  it('recovers legacy answered-call rows without throwing', () => {
    const rows = parseLegacyBiffBuffer<Record<string, unknown>>(
      readFixture('llamadas_x_fecha_periodo.XLS')
    );

    expect(rows.length).toBeGreaterThan(100);
    expect(Object.keys(rows[0] ?? {})).toEqual(
      expect.arrayContaining([
        'dst',
        'fecha',
        'periodo',
        'hora',
        'min',
        'llamadas',
        'coneccion',
      ])
    );
    expect(rows[0]).toEqual(
      expect.objectContaining({
        fecha: '27-Jan-26',
        periodo: '12:00-12:29',
        hora: '12',
        min: '25',
      })
    );
  });

  it('recovers legacy abandoned-call rows without throwing', () => {
    const rows = parseLegacyBiffBuffer<Record<string, unknown>>(
      readFixture('llamadas_abandonadas.XLS')
    );

    expect(rows.length).toBeGreaterThan(100);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        telefono: '+180923686',
        dst: '8096202020',
        fecha: '27-Jan-26',
        hora: '19:28:34',
        disposition: 'ANSWERED',
      })
    );
  });

  it('recovers legacy transaction rows without throwing', () => {
    const rows = parseLegacyBiffBuffer<Record<string, unknown>>(
      readFixture('EXPORT_TRS.XLS')
    );

    expect(rows.length).toBeGreaterThan(100);
    expect(Object.keys(rows[0] ?? {})).toEqual(
      expect.arrayContaining([
        'cod_unidad',
        'nom_unidad',
        'tipo_fac',
        'telefono',
        'fecha',
        'hora',
        'hora_prometida',
        'canal',
        'cliente',
        'registro',
        'estatuscc',
        'valor',
      ])
    );
    expect(rows[0]).toEqual(
      expect.objectContaining({
        cod_unidad: '01',
        nom_unidad: 'UNICENTRO',
        fecha: '27-Jan-26',
        hora: '10:24',
      })
    );
  });
});

describe('processTransactions', () => {
  it('uses registro as the source for agent performance and classifies digital platforms', () => {
    const { clean, raw } = processTransactions([
      {
        nom_unidad: 'UNICENTRO',
        tipo_fac: 'D',
        fecha: '27-Jan-26',
        hora: '18:18',
        canal: 'CC',
        registro: 'adrian cedeño',
        estatuscc: 'N',
        valor: '1652.50',
      },
      {
        nom_unidad: 'UNICENTRO',
        tipo_fac: 'D',
        fecha: '27-Jan-26',
        hora: '19:21',
        canal: 'WEB',
        registro: 'WEB',
        estatuscc: 'N',
        valor: '0',
      },
      {
        nom_unidad: 'BELLA VISTA',
        tipo_fac: 'C',
        fecha: '27-Jan-26',
        hora: '11:27',
        canal: 'AG',
        registro: 'AG',
        estatuscc: 'A',
        valor: '450',
      },
    ]);

    expect(clean).toHaveLength(2);
    expect(clean[0]).toMatchObject({
      agente: 'adrian cedeño',
      agenteTipo: 'agente',
      plataforma: 'Monitoreo Call Center',
      estatus: 'N',
    });
    expect(clean[1]).toMatchObject({
      agente: 'Web',
      agenteTipo: 'plataforma',
      agenteCodigo: 'WEB',
      plataforma: 'Web',
      estatus: 'N',
    });

    expect(raw[2]).toMatchObject({
      agente: 'Agregadores',
      agenteTipo: 'plataforma',
      agenteCodigo: 'AG',
      estatus: 'A',
    });
  });
});

describe('aggregateByAgent', () => {
  it('groups human agents and digital platforms separately using only valid transactions', () => {
    const { raw } = processTransactions([
      {
        nom_unidad: 'UNICENTRO',
        tipo_fac: 'D',
        fecha: '27-Jan-26',
        hora: '18:18',
        canal: 'CC',
        registro: 'adrian cedeño',
        estatuscc: 'N',
        valor: '1652.50',
      },
      {
        nom_unidad: 'UNICENTRO',
        tipo_fac: 'D',
        fecha: '27-Jan-26',
        hora: '19:24',
        canal: 'CC',
        registro: 'adrian cedeño',
        estatuscc: 'N',
        valor: '2145.00',
      },
      {
        nom_unidad: 'UNICENTRO',
        tipo_fac: 'D',
        fecha: '27-Jan-26',
        hora: '19:21',
        canal: 'WEB',
        registro: 'WEB',
        estatuscc: 'N',
        valor: '0',
      },
      {
        nom_unidad: 'BELLA VISTA',
        tipo_fac: 'C',
        fecha: '27-Jan-26',
        hora: '11:27',
        canal: 'AG',
        registro: 'AG',
        estatuscc: 'A',
        valor: '450',
      },
    ]);

    const aggregated = aggregateByAgent(raw);

    expect(aggregated).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          agente: 'adrian cedeño',
          tipo: 'agente',
          transacciones: 2,
          ventas: 3797.5,
        }),
        expect.objectContaining({
          agente: 'Web',
          tipo: 'plataforma',
          codigo: 'WEB',
          transacciones: 1,
          ventas: 0,
        }),
      ])
    );
    expect(aggregated.find((item) => item.codigo === 'AG')).toBeUndefined();
  });
});
