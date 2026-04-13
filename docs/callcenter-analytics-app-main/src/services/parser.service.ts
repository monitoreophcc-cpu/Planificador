import Papa from 'papaparse';
import { readSheet } from 'read-excel-file/browser';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
} from '@/types/dashboard.types';
import { getShift } from './shift.service';

export const parseCsvFile = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

function rowsToObjects<T>(rows: Array<Array<unknown | null>>): T[] {
  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((cell, index) => {
    const header = String(cell ?? '').trim();
    return header || `column_${index}`;
  });

  return dataRows
    .filter((row) =>
      row.some((cell) => cell != null && String(cell).trim() !== '')
    )
    .map((row) => {
      const record: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        record[header] = row[index] ?? '';
      });

      return record as T;
    });
}

async function parseWithXlsxFallback<T>(file: File): Promise<T[]> {
  const XLSX = await import('xlsx');
  const data = new Uint8Array(await file.arrayBuffer());
  const workbook = XLSX.read(data, {
    type: 'array',
    raw: false,
    cellDates: true,
    dateNF: 'yyyy-mm-dd hh:mm:ss',
  });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(unknown | null)[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
    raw: false,
  });

  return rowsToObjects<T>(rows);
}

export const parseXlsxFile = async <T>(file: File): Promise<T[]> => {
  const lowerFileName = file.name.toLowerCase();

  if (lowerFileName.endsWith('.xls')) {
    return parseWithXlsxFallback<T>(file);
  }

  try {
    const rows = await readSheet(file);
    return rowsToObjects<T>(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    // Some operational files arrive mislabeled as .xlsx even though they are legacy .xls.
    if (message.includes('invalid zip')) {
      return parseWithXlsxFallback<T>(file);
    }

    throw error;
  }
};

// --- Data Processing ---

function toNumber(v: any): number {
  if (v == null || v === '') return 0;
  const s = String(v).trim().replace(/,/g, '.');
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function fixHora(h: any): string {
  if (!h) return '00:00:00';
  if (h instanceof Date) {
    return (
      h.getHours().toString().padStart(2, '0') +
      ':' +
      h.getMinutes().toString().padStart(2, '0') +
      ':' +
      h.getSeconds().toString().padStart(2, '0')
    );
  }
  const s = String(h).trim();
  try {
    if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(s)) {
      const [H = '0', M = '0', S = '0'] = s.split(':');
      return `${String(+H).padStart(2, '0')}:${String(+M).padStart(
        2,
        '0'
      )}:${String(+S).padStart(2, '0')}`;
    }
    if (/^\d{1,2}$/.test(s)) {
      return `${String(+s).padStart(2, '0')}:00:00`;
    }
    const dt = new Date('1970-01-01T' + s);
    if (!isNaN(dt.getTime())) {
      return `${String(dt.getHours()).padStart(2, '0')}:${String(
        dt.getMinutes()
      ).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;
    }
  } catch (e) {}
  return '00:00:00';
}

function periodo30(hhmmss: string): string {
  const [hh, mm] = fixHora(hhmmss).split(':').map(Number);
  return mm < 30
    ? `${String(hh).padStart(2, '0')}:00`
    : `${String(hh).padStart(2, '0')}:30`;
}

function normalizeDate(d: any): string {
  if (!d) return '';
  if (d instanceof Date) {
    try {
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - tzOffset);
      return localDate.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})-([A-Za-z]{3,4})-(\d{2,4})$/);
  if (m) {
    const day = ('0' + m[1]).slice(-2);
    const monStr = m[2].toLowerCase();
    const monMap: { [key: string]: string } = {
      jan: '01',
      ene: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      abr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      aug: '08',
      ago: '08',
      sep: '09',
      sept: '09',
      set: '09',
      oct: '10',
      nov: '11',
      dec: '12',
      dic: '12',
    };
    const mon = monMap[monStr] || '01';
    let year = m[3];
    if (year.length === 2) {
      year = +year >= 70 ? '19' + year : '20' + year;
    }
    return `${year}-${mon}-${day}`;
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const tzOffset = dt.getTimezoneOffset() * 60000;
    const localDate = new Date(dt.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 10);
  }
  return s;
}

function mapRawFields(rawRow: any, findKeys: string[]): string {
  const normalizedRow: { [key: string]: any } = {};
  Object.keys(rawRow).forEach((k) => {
    const normalizedKey = k
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    normalizedRow[normalizedKey] = rawRow[k];
  });

  for (const key of findKeys) {
    const normalizedKey = key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    if (Object.prototype.hasOwnProperty.call(normalizedRow, normalizedKey)) {
      return String(normalizedRow[normalizedKey] ?? '');
    }
  }
  return '';
}

function resolveTransactionPlatform(
  plataformaCode: string,
  registro: string,
  platformLabels: Record<string, string>
): string {
  if (plataformaCode) {
    return platformLabels[plataformaCode] || plataformaCode;
  }

  const normalizedRegistro = registro.toLowerCase();
  if (normalizedRegistro.includes('whatsapp') || normalizedRegistro.includes('wa')) {
    return platformLabels.WA;
  }
  if (normalizedRegistro.includes('web')) {
    return platformLabels.WEB;
  }
  if (normalizedRegistro.includes('app')) {
    return platformLabels.APP;
  }
  if (normalizedRegistro.includes('agregador')) {
    return platformLabels.AG;
  }

  return registro || 'Sin plataforma';
}

export function getUniqueDates(raw: any[]): string[] {
  const dates = raw.map((r) =>
    normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia']))
  );
  return [...new Set(dates.filter((d) => d))];
}

export function processAnsweredCalls(raw: any[]): AnsweredCall[] {
  return raw
    .map((r, index) => {
      const hora = fixHora(mapRawFields(r, ['hora', 'time', 'tiempo']));
      const dst = String(
        mapRawFields(r, ['dst', 'destino', 'troncal', 'destination']) || ''
      );
      const agente = String(
        mapRawFields(r, ['agente', 'agent', 'operador', 'user', 'nombre']) || ''
      );
      const calidad = toNumber(
        mapRawFields(r, ['calidad', 'quality', 'rating', 'calificacion'])
      );

      return {
        id: `ans-${index}`,
        dst,
        agente: agente || (dst.length < 10 ? dst : 'Desconocido'),
        fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
        periodo: String(
          mapRawFields(r, ['periodo', 'slot', 'horario']) || ''
        ),
        hora,
        llamadas: toNumber(
          mapRawFields(r, ['llamadas', 'calls', 'count', 'cantidad'])
        ),
        conexion: toNumber(
          mapRawFields(r, [
            'conexion',
            'coneccion',
            'tiempo',
            'duracion',
            'duration',
          ])
        ),
        calidad: calidad > 0 ? calidad : undefined,
        turno: getShift(hora),
      } as AnsweredCall;
    })
    .filter(
      (r) => r.dst !== '8095330202' && (r.llamadas > 0 || r.conexion > 0)
    );
}

export function processAbandonedCalls(raw: any[]): {
  clean: AbandonedCall[];
  raw: AbandonedCall[];
} {
  const cleanedRaw: AbandonedCall[] = raw
    .map((r, index) => {
      const hora = fixHora(mapRawFields(r, ['hora', 'time', 'tiempo']));
      return {
        id: `abn-${index}`,
        telefono: String(
          mapRawFields(r, ['telefono', 'phone', 'callerid', 'numero']) || ''
        ),
        fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
        hora: hora,
        conexion: toNumber(
          mapRawFields(r, [
            'conexion',
            'coneccion',
            'tiempo',
            'duracion',
            'duration',
          ])
        ),
        periodo: periodo30(hora),
        turno: getShift(hora),
        disposition: String(
          mapRawFields(r, ['disposition', 'estado', 'status']) || ''
        ),
      };
    })
    .filter((r) => r.telefono !== '' || r.conexion > 0);

  const telCount = new Map<string, number>();
  cleanedRaw.forEach((r) => {
    const k = r.telefono || '';
    telCount.set(k, (telCount.get(k) || 0) + 1);
  });

  const fullRaw = cleanedRaw.map((r) => ({
    ...r,
    isDuplicate: (telCount.get(r.telefono) || 0) > 1,
    isLT20: r.conexion < 20,
  }));

  const clean = fullRaw.filter((r) => !r.isDuplicate && !r.isLT20);

  return { clean, raw: fullRaw };
}

export function processTransactions(raw: any[]): {
  clean: Transaction[];
  raw: Transaction[];
} {
  const PLATFORM_LABELS: { [key: string]: string } = {
    CC: 'Monitoreo Call Center',
    APP: 'App',
    WA: 'WhatsApp',
    WEB: 'Web',
    AG: 'Agregadores',
  };

  const resolveCanalReal = (
    tipoFacRaw: string,
    plataformaCode: string
  ): string => {
    if (String(plataformaCode || '').toUpperCase() === 'AG') return 'Agregador';
    const v = String(tipoFacRaw || '').toUpperCase();
    if (v === 'D') return 'Delivery';
    if (v === 'C') return 'Carryout';
    return v || '';
  };

  const resolveAgent = (row: any): string | undefined => {
    const fromKnownFields = String(
      mapRawFields(row, [
        'agente',
        'agent',
        'operador',
        'usuario',
        'user',
        'vendedor',
        'asesor',
        'representante',
        'cajero',
        'nom_vendedor',
        'nombre_vendedor',
      ]) || ''
    ).trim();
    if (fromKnownFields) return fromKnownFields;

    const rawKeys = Object.keys(row || {});
    const fuzzyKey = rawKeys.find((key) => {
      const normalizedKey = key
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '');
      return (
        normalizedKey.includes('agent') ||
        normalizedKey.includes('agente') ||
        normalizedKey.includes('vendedor') ||
        normalizedKey.includes('asesor') ||
        normalizedKey.includes('representante') ||
        normalizedKey.includes('usuario') ||
        normalizedKey.includes('cajero')
      );
    });

    return fuzzyKey ? String(row[fuzzyKey] || '').trim() || undefined : undefined;
  };

  const allTransactions = raw.map((r, index) => {
    const plataforma = (
      mapRawFields(r, ['canal', 'plataforma']) || ''
    ).toUpperCase();
    const registro = String(
      mapRawFields(r, ['registro', 'descripcion', 'detalle']) || ''
    ).trim();
    return {
      id: `trx-${index}`,
      agente: resolveAgent(r),
      sucursal: mapRawFields(r, [
        'nom_unidad',
        'nomunidad',
        'sucursal',
        'tienda',
      ]),
      canalReal: resolveCanalReal(
        mapRawFields(r, ['tipo_fac', 'tipofac']),
        plataforma
      ),
      plataforma: resolveTransactionPlatform(plataforma, registro, PLATFORM_LABELS),
      plataformaCode: plataforma,
      fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
      hora: fixHora(mapRawFields(r, ['hora', 'time', 'tiempo'])),
      estatus: (
        mapRawFields(r, ['estatuscc', 'estatus', 'estado']) || ''
      ).toUpperCase(),
      valor: toNumber(mapRawFields(r, ['valor', 'monto', 'total'])),
    };
  });

  const cleanTransactions = allTransactions.filter((r) => r.estatus === 'N');

  return { clean: cleanTransactions, raw: allTransactions };
}
