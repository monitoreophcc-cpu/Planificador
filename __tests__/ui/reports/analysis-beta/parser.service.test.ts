import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { aggregateByAgent } from '@/ui/reports/analysis-beta/services/kpi.service';
import {
  parseLegacyBiffBuffer,
  parseXlsxFile,
  processTransactions,
} from '@/ui/reports/analysis-beta/services/parser.service';

function readFixture(name: string): Uint8Array {
  const archivedPath = join(
    process.cwd(),
    'docs',
    'callcenter-analytics-app-main',
    'docs',
    name
  );
  const rootDocsPath = join(process.cwd(), 'docs', name);
  const absolutePath = existsSync(archivedPath) ? archivedPath : rootDocsPath;

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
        fecha: expect.any(String),
        periodo: expect.any(String),
        hora: expect.any(String),
        min: expect.any(String),
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
        telefono: expect.any(String),
        dst: expect.any(String),
        fecha: expect.any(String),
        hora: expect.any(String),
        disposition: expect.any(String),
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
        cod_unidad: expect.any(String),
        nom_unidad: expect.any(String),
        fecha: expect.any(String),
        hora: expect.any(String),
      })
    );
  });
});

describe('processTransactions', () => {
  it('combines rows from every sheet when the workbook has multiple months', async () => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ['nom_unidad', 'tipo_fac', 'fecha', 'hora', 'canal', 'registro', 'estatuscc', 'valor'],
        ['UNICENTRO', 'D', '2026-01-31', '10:15', 'CC', 'wanda', 'N', '1250'],
      ]),
      'Enero'
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ['nom_unidad', 'tipo_fac', 'fecha', 'hora', 'canal', 'registro', 'estatuscc', 'valor'],
        ['UNICENTRO', 'D', '2026-02-01', '11:20', 'CC', 'nicole', 'N', '980'],
      ]),
      'Febrero'
    );

    const workbookBuffer = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    }) as ArrayBuffer;
    const file = new File(
      [workbookBuffer],
      'trimestre.xlsx',
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => workbookBuffer,
    });

    const rows = await parseXlsxFile<Record<string, unknown>>(file);
    const { clean } = processTransactions(rows);

    expect(rows).toHaveLength(2);
    expect(clean).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fecha: '2026-01-31', agente: 'wanda' }),
        expect.objectContaining({ fecha: '2026-02-01', agente: 'nicole' }),
      ])
    );
  });

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
      plataforma: 'Call center',
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

    const adrian = aggregated.find(
      (item) => item.agente === 'adrian cedeño' && item.tipo === 'agente'
    );
    expect(adrian).toMatchObject({
      agente: 'adrian cedeño',
      tipo: 'agente',
      transacciones: 2,
    });
    expect(adrian?.ventas ?? 0).toBeCloseTo(3087.508804975, 6);

    expect(aggregated).toEqual(
      expect.arrayContaining([
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
