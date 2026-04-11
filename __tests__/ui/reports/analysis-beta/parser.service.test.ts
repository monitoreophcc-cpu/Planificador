import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseLegacyBiffBuffer } from '@/ui/reports/analysis-beta/services/parser.service';

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
