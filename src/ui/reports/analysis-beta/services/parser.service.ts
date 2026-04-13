import Papa from 'papaparse';
import { readSheet } from 'read-excel-file/browser';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
} from '@/ui/reports/analysis-beta/types/dashboard.types';
import { getShift } from './shift.service';

const UTF8_REPLACEMENT_SEQUENCE = [0xef, 0xbf, 0xbd] as const;
const XLSX_NOISY_MESSAGES = [
  'Missing Info for XLS Record',
  'String record expects Formula',
  'Unrecognized CP',
];

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

function decodeLatin1(bytes: Uint8Array): string {
  let output = '';

  for (const byte of bytes) {
    output += String.fromCharCode(byte);
  }

  return output;
}

function readUint16LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}

function contractUtf8ReplacementBytes(source: Uint8Array): {
  bytes: Uint8Array;
  replacementMask: boolean[];
} {
  const bytes: number[] = [];
  const replacementMask: boolean[] = [];

  for (let index = 0; index < source.length; ) {
    const matchesReplacement =
      index + 2 < source.length &&
      source[index] === UTF8_REPLACEMENT_SEQUENCE[0] &&
      source[index + 1] === UTF8_REPLACEMENT_SEQUENCE[1] &&
      source[index + 2] === UTF8_REPLACEMENT_SEQUENCE[2];

    if (matchesReplacement) {
      bytes.push(0);
      replacementMask.push(true);
      index += 3;
      continue;
    }

    bytes.push(source[index]);
    replacementMask.push(false);
    index += 1;
  }

  return {
    bytes: Uint8Array.from(bytes),
    replacementMask,
  };
}

function hasUtf8ReplacementArtifacts(data: Uint8Array): boolean {
  for (let index = 0; index + 2 < data.length; index += 1) {
    if (
      data[index] === UTF8_REPLACEMENT_SEQUENCE[0] &&
      data[index + 1] === UTF8_REPLACEMENT_SEQUENCE[1] &&
      data[index + 2] === UTF8_REPLACEMENT_SEQUENCE[2]
    ) {
      return true;
    }
  }

  return false;
}

function looksLikeLegacyBiffWorkbook(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x09 && data[1] === 0x00;
}

function decodeLegacyNumber(
  bytes: Uint8Array,
  replacementMask: boolean[]
): number {
  const value = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength
  ).getFloat64(0, true);

  // A very common corruption in these exports only affects the high mantissa
  // byte of BIFF doubles that were originally `1`.
  if (
    replacementMask[6] &&
    !replacementMask.slice(0, 6).some(Boolean) &&
    !replacementMask[7] &&
    bytes[0] === 0 &&
    bytes[1] === 0 &&
    bytes[2] === 0 &&
    bytes[3] === 0 &&
    bytes[4] === 0 &&
    bytes[5] === 0 &&
    bytes[7] === 0x3f
  ) {
    return 1;
  }

  return value;
}

type LegacyCellMatch =
  | { kind: 'label'; row: number; col: number; value: string; size: number }
  | { kind: 'number'; row: number; col: number; value: number; size: number };

function matchLegacyLabelRecord(
  data: Uint8Array,
  offset: number,
  maxRow: number,
  maxCol: number,
  minRow: number
): LegacyCellMatch | null {
  if (offset + 4 > data.length) {
    return null;
  }

  const recordType = readUint16LE(data, offset);
  const length = readUint16LE(data, offset + 2);

  if (recordType !== 0x0004 || length < 8 || length > 260) {
    return null;
  }

  if (offset + 4 + length > data.length) {
    return null;
  }

  const body = data.subarray(offset + 4, offset + 4 + length);
  const row = readUint16LE(body, 0);
  const col = readUint16LE(body, 2);
  const textLength = body[7];

  if (
    row < minRow ||
    row > maxRow ||
    col > maxCol ||
    8 + textLength !== length
  ) {
    return null;
  }

  return {
    kind: 'label',
    row,
    col,
    value: decodeLatin1(body.subarray(8, 8 + textLength))
      .replace(/\0/g, '')
      .trim(),
    size: 4 + length,
  };
}

function matchLegacyNumberRecord(
  data: Uint8Array,
  replacementMask: boolean[],
  offset: number,
  maxRow: number,
  maxCol: number,
  minRow: number
): LegacyCellMatch | null {
  if (offset + 19 > data.length) {
    return null;
  }

  const recordType = readUint16LE(data, offset);
  const length = readUint16LE(data, offset + 2);

  if (recordType !== 0x0003 || length !== 15) {
    return null;
  }

  const body = data.subarray(offset + 4, offset + 19);
  const row = readUint16LE(body, 0);
  const col = readUint16LE(body, 2);

  if (row < minRow || row > maxRow || col > maxCol) {
    return null;
  }

  const numericBytes = body.subarray(7, 15);
  const numericMask = replacementMask.slice(offset + 11, offset + 19);

  return {
    kind: 'number',
    row,
    col,
    value: decodeLegacyNumber(numericBytes, numericMask),
    size: 19,
  };
}

function isKnownLegacyMetaRecord(data: Uint8Array, offset: number): boolean {
  if (offset + 4 > data.length) {
    return false;
  }

  const recordType = readUint16LE(data, offset);
  const length = readUint16LE(data, offset + 2);

  const isKnownRecord =
    (recordType === 0x0009 && length === 4) ||
    (recordType === 0x0042 && length === 2) ||
    (recordType === 0x0000 && length === 8) ||
    (recordType === 0x0024 && length === 4) ||
    (recordType === 0x000a && length === 0);

  return isKnownRecord && offset + 4 + length <= data.length;
}

export function parseLegacyBiffBuffer<T>(
  input: ArrayBuffer | Uint8Array
): T[] {
  const source = input instanceof Uint8Array ? input : new Uint8Array(input);
  const { bytes, replacementMask } = contractUtf8ReplacementBytes(source);
  const cells = new Map<string, string | number>();

  let offset = 0;
  let maxRow = 50_000;
  let maxCol = 512;
  let lastAcceptedRow = 0;

  while (offset + 4 <= bytes.length) {
    const recordType = readUint16LE(bytes, offset);
    const length = readUint16LE(bytes, offset + 2);

    if (recordType === 0x0009 && length === 4) {
      offset += 8;
      continue;
    }

    if (recordType === 0x0042 && length === 2) {
      offset += 6;
      continue;
    }

    if (recordType === 0x0000 && length === 8) {
      const body = bytes.subarray(offset + 4, offset + 12);
      maxRow = readUint16LE(body, 2) + 2;
      maxCol = readUint16LE(body, 6) + 2;
      offset += 12;
      continue;
    }

    if (recordType === 0x0024 && length === 4) {
      offset += 8;
      continue;
    }

    const minRow = Math.max(0, lastAcceptedRow - 1);
    const matchedRecord =
      matchLegacyLabelRecord(bytes, offset, maxRow, maxCol, minRow) ??
      matchLegacyNumberRecord(
        bytes,
        replacementMask,
        offset,
        maxRow,
        maxCol,
        minRow
      );

    if (matchedRecord) {
      cells.set(
        `${matchedRecord.row}:${matchedRecord.col}`,
        matchedRecord.value
      );
      lastAcceptedRow = Math.max(lastAcceptedRow, matchedRecord.row);
      offset += matchedRecord.size;
      continue;
    }

    if (recordType === 0x000a && length === 0) {
      offset += 4;
      continue;
    }

    let resyncedOffset = -1;

    for (
      let probe = offset + 1;
      probe < Math.min(offset + 33, bytes.length - 4);
      probe += 1
    ) {
      const probeMatchedRecord =
        matchLegacyLabelRecord(bytes, probe, maxRow, maxCol, minRow) ??
        matchLegacyNumberRecord(
          bytes,
          replacementMask,
          probe,
          maxRow,
          maxCol,
          minRow
        );

      if (probeMatchedRecord || isKnownLegacyMetaRecord(bytes, probe)) {
        resyncedOffset = probe;
        break;
      }
    }

    if (resyncedOffset === -1) {
      break;
    }

    offset = resyncedOffset;
  }

  if (cells.size === 0) {
    return [];
  }

  const rows = new Map<number, Array<unknown | null>>();

  for (const [key, value] of cells.entries()) {
    const [row, col] = key.split(':').map(Number);
    const targetRow = rows.get(row) ?? [];
    targetRow[col] = value;
    rows.set(row, targetRow);
  }

  const orderedRows = [...rows.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, row]) => row);

  return rowsToObjects<T>(orderedRows);
}

function withSuppressedXlsxConsoleNoise<T>(operation: () => T): T {
  const originalConsoleError = console.error;

  console.error = (...args: unknown[]) => {
    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        return String(arg);
      })
      .join(' ');

    if (XLSX_NOISY_MESSAGES.some((needle) => message.includes(needle))) {
      return;
    }

    originalConsoleError(...args);
  };

  try {
    return operation();
  } finally {
    console.error = originalConsoleError;
  }
}

async function parseWithXlsxFallback<T>(file: File): Promise<T[]> {
  const data = new Uint8Array(await file.arrayBuffer());

  if (looksLikeLegacyBiffWorkbook(data) && hasUtf8ReplacementArtifacts(data)) {
    const legacyRows = parseLegacyBiffBuffer<T>(data);

    if (legacyRows.length > 0) {
      return legacyRows;
    }
  }

  const XLSX = await import('xlsx');
  const workbook = withSuppressedXlsxConsoleNoise(() =>
    XLSX.read(data, {
      type: 'array',
      raw: false,
      cellDates: true,
      dateNF: 'yyyy-mm-dd hh:mm:ss',
    })
  );
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
    try {
      return await parseWithXlsxFallback<T>(file);
    } catch (error) {
      const data = new Uint8Array(await file.arrayBuffer());
      const legacyRows = parseLegacyBiffBuffer<T>(data);

      if (legacyRows.length > 0) {
        return legacyRows;
      }

      throw error;
    }
  }

  try {
    const rows = await readSheet(file);
    return rowsToObjects<T>(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    // Some operational files arrive mislabeled as .xlsx even though they are legacy .xls.
    if (
      message.includes('invalid zip') ||
      message.includes('string record expects formula') ||
      message.includes('unrecognized cp')
    ) {
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
  const normalizedPlatformCode = String(plataformaCode || '').trim().toUpperCase();
  if (normalizedPlatformCode) {
    return platformLabels[normalizedPlatformCode] || normalizedPlatformCode;
  }

  const normalizedRegistro = registro.trim().toUpperCase();
  if (normalizedRegistro in platformLabels) {
    return platformLabels[normalizedRegistro];
  }

  const registroWords = normalizedRegistro.toLowerCase();
  if (registroWords.includes('whatsapp')) {
    return platformLabels.WA;
  }
  if (registroWords.includes('web')) {
    return platformLabels.WEB;
  }
  if (registroWords.includes('app')) {
    return platformLabels.APP;
  }
  if (registroWords.includes('agregador')) {
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
  const DIGITAL_PLATFORM_CODES = ['WA', 'WEB', 'AG', 'APP'] as const;
  const PLATFORM_LABELS: { [key: string]: string } = {
    CC: 'Call center',
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

  const normalizeRegistro = (value: string) => value.trim().replace(/\s+/g, ' ');

  const resolveAgentFieldFallback = (row: any): string | undefined => {
    const fromKnownFields = normalizeRegistro(
      String(
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
    )
    );
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

    return fuzzyKey
      ? normalizeRegistro(String(row[fuzzyKey] || '')) || undefined
      : undefined;
  };

  const resolveTransactionActor = (
    row: any,
    plataformaCode: string
  ): Pick<Transaction, 'agente' | 'agenteTipo' | 'agenteCodigo'> => {
    const registro = normalizeRegistro(
      String(mapRawFields(row, ['registro', 'descripcion', 'detalle']) || '')
    );
    const normalizedRegistro = registro.toUpperCase();

    if (
      normalizedRegistro &&
      DIGITAL_PLATFORM_CODES.includes(
        normalizedRegistro as (typeof DIGITAL_PLATFORM_CODES)[number]
      )
    ) {
      return {
        agente: PLATFORM_LABELS[normalizedRegistro] || normalizedRegistro,
        agenteTipo: 'plataforma',
        agenteCodigo: normalizedRegistro,
      };
    }

    if (registro) {
      return {
        agente: registro,
        agenteTipo: 'agente',
      };
    }

    const fallback = resolveAgentFieldFallback(row);
    if (fallback) {
      const normalizedFallback = fallback.toUpperCase();
      if (
        DIGITAL_PLATFORM_CODES.includes(
          normalizedFallback as (typeof DIGITAL_PLATFORM_CODES)[number]
        )
      ) {
        return {
          agente: PLATFORM_LABELS[normalizedFallback] || normalizedFallback,
          agenteTipo: 'plataforma',
          agenteCodigo: normalizedFallback,
        };
      }

      return {
        agente: fallback,
        agenteTipo: 'agente',
      };
    }

    if (
      DIGITAL_PLATFORM_CODES.includes(
        plataformaCode as (typeof DIGITAL_PLATFORM_CODES)[number]
      )
    ) {
      return {
        agente: PLATFORM_LABELS[plataformaCode] || plataformaCode,
        agenteTipo: 'plataforma',
        agenteCodigo: plataformaCode,
      };
    }

    return {
      agente: undefined,
      agenteTipo: 'sin_registro',
      agenteCodigo: undefined,
    };
  };

  const allTransactions = raw.map((r, index) => {
    const plataforma = String(
      mapRawFields(r, ['canal', 'plataforma']) || ''
    )
      .trim()
      .toUpperCase();
    const registro = normalizeRegistro(
      String(
      mapRawFields(r, ['registro', 'descripcion', 'detalle']) || ''
      )
    );
    const actor = resolveTransactionActor(r, plataforma);
    return {
      id: `trx-${index}`,
      ...actor,
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
