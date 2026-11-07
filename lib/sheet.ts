/**
 * Just enough spreadsheet support for product price lists, with no
 * dependency: read the first sheet of an .xlsx (or a .csv) into rows of
 * cells, and write a small .xlsx (the sample format).
 *
 * An .xlsx is a zip of XML files. Unzipping uses the platform's
 * DecompressionStream (all current browsers, Node 18+); the XML is regular
 * enough that a few careful regexes read it, which keeps this testable in
 * Node, where there is no DOMParser.
 */

export type Cell = string | number | boolean | null;
export type Rows = Cell[][];

export class SheetError extends Error {}

// ── Reading ────────────────────────────────────────────────

/** Reads the first sheet of an .xlsx or a .csv/.txt file. */
export async function readSpreadsheet(data: ArrayBuffer | Uint8Array, fileName: string): Promise<Rows> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const isZip = bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (isZip) return readXlsx(bytes);
  if (/\.xls$/i.test(fileName) || (bytes[0] === 0xd0 && bytes[1] === 0xcf)) {
    throw new SheetError('Old .xls files are not supported. In Excel, use File → Save As → Excel Workbook (.xlsx), then upload that.');
  }
  return parseCsv(new TextDecoder('utf-8').decode(bytes).replace(/^﻿/, ''));
}

type ZipEntry = { name: string; method: number; compressedSize: number; offset: number };

function zipEntries(b: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  // End of central directory: last 22 bytes, plus up to 64 KB of comment.
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new SheetError('This file is not a valid Excel workbook.');
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const entries = new Map<string, ZipEntry>();
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new SheetError('This Excel file looks damaged.');
    const method = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const offset = view.getUint32(p + 42, true);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nameLen));
    entries.set(name.replace(/^\//, ''), { name, method, compressedSize, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function zipText(b: Uint8Array, entries: Map<string, ZipEntry>, name: string): Promise<string | null> {
  const e = entries.get(name);
  if (!e) return null;
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (view.getUint32(e.offset, true) !== 0x04034b50) throw new SheetError('This Excel file looks damaged.');
  const start = e.offset + 30 + view.getUint16(e.offset + 26, true) + view.getUint16(e.offset + 28, true);
  const raw = b.subarray(start, start + e.compressedSize);
  let out: Uint8Array;
  if (e.method === 0) out = raw;
  else if (e.method === 8) out = await inflateRaw(raw);
  else throw new SheetError('This Excel file uses an unsupported compression. Save it again as .xlsx and retry.');
  return new TextDecoder('utf-8').decode(out);
}

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    const k = e.toLowerCase();
    if (k === 'amp') return '&';
    if (k === 'lt') return '<';
    if (k === 'gt') return '>';
    if (k === 'quot') return '"';
    if (k === 'apos') return "'";
    const code = k.startsWith('#x') ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : '';
  });
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[m[1]] = decodeXml(m[3] ?? m[4] ?? '');
  return out;
}

/** All <t> text in a fragment (rich-text runs joined), ignoring phonetic hints. */
function textOf(fragment: string): string {
  const clean = fragment.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
  let s = '';
  for (const m of clean.matchAll(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g)) s += decodeXml(m[1] ?? '');
  return s;
}

function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/i.exec(ref)?.[0].toUpperCase() ?? '';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

async function firstSheetPath(b: Uint8Array, entries: Map<string, ZipEntry>): Promise<string> {
  const workbook = await zipText(b, entries, 'xl/workbook.xml');
  const rels = await zipText(b, entries, 'xl/_rels/workbook.xml.rels');
  if (workbook && rels) {
    const sheet = /<(?:\w+:)?sheet\b[^>]*>/.exec(workbook);
    const rid = sheet ? Object.entries(attrs(sheet[0])).find(([k]) => k.endsWith(':id'))?.[1] : undefined;
    for (const m of rels.matchAll(/<(?:\w+:)?Relationship\b[^>]*>/g)) {
      const a = attrs(m[0]);
      if (a.Id === rid && a.Target) {
        return a.Target.startsWith('/') ? a.Target.slice(1) : `xl/${a.Target.replace(/^\.\//, '')}`;
      }
    }
  }
  const fallback = [...entries.keys()].filter((k) => /^xl\/worksheets\/[^/]+\.xml$/.test(k)).sort()[0];
  if (!fallback) throw new SheetError('No sheet found in this Excel file.');
  return fallback;
}

async function readXlsx(b: Uint8Array): Promise<Rows> {
  const entries = zipEntries(b);
  if (!entries.has('xl/workbook.xml')) throw new SheetError('This file is not an Excel workbook (.xlsx).');
  const shared: string[] = [];
  const sst = await zipText(b, entries, 'xl/sharedStrings.xml');
  if (sst) for (const m of sst.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>|<si\b[^>]*\/>/g)) shared.push(textOf(m[1] ?? ''));

  const xml = await zipText(b, entries, await firstSheetPath(b, entries));
  if (!xml) throw new SheetError('The first sheet of this Excel file is missing.');
  const data = /<sheetData\b[^>]*>([\s\S]*)<\/sheetData>/.exec(xml)?.[1] ?? '';

  const rows: Rows = [];
  let nextRow = 0;
  for (const rm of data.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const r = Number(attrs(rm[1]).r);
    const rowIndex = Number.isFinite(r) && r > 0 ? r - 1 : nextRow;
    nextRow = rowIndex + 1;
    const cells: Cell[] = [];
    let nextCol = 0;
    for (const cm of (rm[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const a = attrs(cm[1]);
      const col = a.r ? columnIndex(a.r) : nextCol;
      nextCol = col + 1;
      const body = cm[2] ?? '';
      const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: Cell = null;
      switch (a.t) {
        case 's':
          value = v === undefined ? null : (shared[Number(v)] ?? null);
          break;
        case 'inlineStr':
          value = textOf(/<is\b[^>]*>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? '');
          break;
        case 'str':
          value = v === undefined ? null : decodeXml(v);
          break;
        case 'b':
          value = v === '1';
          break;
        case 'e':
          value = null;
          break;
        default:
          value = v === undefined || v === '' ? null : Number(v);
          if (typeof value === 'number' && !Number.isFinite(value)) value = decodeXml(v ?? '');
      }
      while (cells.length < col) cells.push(null);
      cells[col] = value;
    }
    while (rows.length < rowIndex) rows.push([]);
    rows[rowIndex] = cells;
  }
  return rows;
}

/** RFC 4180 CSV; also accepts ';' or tab separated (Excel in some locales). */
export function parseCsv(text: string): Rows {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const sep = [',', ';', '\t'].reduce((best, s) => (firstLine.split(s).length > firstLine.split(best).length ? s : best), ',');
  const rows: Rows = [];
  let row: Cell[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => (c === '' ? null : c)));
}

// ── Writing ────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** An uncompressed ("stored") zip — tiny files, so compression isn't worth it. */
function zip(files: { name: string; text: string }[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  // 1 Jan 2025 00:00 in DOS date/time format.
  const dosTime = 0;
  const dosDate = ((2025 - 1980) << 9) | (1 << 5) | 1;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // UTF-8 names
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, data);

    const cd = new Uint8Array(46 + name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    cd.set(name, 46);
    central.push(cd);
    offset += local.length + data.length;
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);

  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
  let p = 0;
  for (const part of all) {
    out.set(part, p);
    p += part.length;
  }
  return out;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
}

function colName(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** A one-sheet .xlsx. The first row is bold (a header); `widths` are in characters. */
export function writeXlsx(rows: Rows, opts: { sheetName?: string; widths?: number[] } = {}): Uint8Array {
  const sheetName = escapeXml((opts.sheetName ?? 'Sheet1').slice(0, 31));
  const cols = opts.widths?.length
    ? `<cols>${opts.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : '';
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((v, c) => {
          const ref = `${colName(c)}${r + 1}`;
          const style = r === 0 ? ' s="1"' : '';
          if (v === null || v === '') return '';
          if (typeof v === 'number') return `<c r="${ref}"${style}><v>${v}</v></c>`;
          if (typeof v === 'boolean') return `<c r="${ref}"${style} t="b"><v>${v ? 1 : 0}</v></c>`;
          return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(v)}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');
  const ns = 'http://schemas.openxmlformats.org';
  return zip([
    {
      name: '[Content_Types].xml',
      text:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${ns}/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`,
    },
    {
      name: '_rels/.rels',
      text:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${ns}/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      text:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${ns}/spreadsheetml/2006/main" xmlns:r="${ns}/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      text:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${ns}/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="${ns}/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: 'xl/styles.xml',
      text:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${ns}/spreadsheetml/2006/main">` +
        `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
        `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>` +
        `</styleSheet>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${ns}/spreadsheetml/2006/main">${cols}<sheetData>${body}</sheetData></worksheet>`,
    },
  ]);
}

/** CSV text for the same rows (Excel-friendly: BOM added by the caller when downloading). */
export function writeCsv(rows: Rows): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = v === null ? '' : String(v);
          return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    )
    .join('\r\n');
}
