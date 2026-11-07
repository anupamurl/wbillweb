import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { computeBill, formatRate, gstSummary, lineGst } from '../lib/gst';
import { parseCsv, readSpreadsheet, writeCsv, writeXlsx } from '../lib/sheet';
import {
  SAMPLE_ROWS,
  itemDocId,
  itemsToRemember,
  mergeCatalog,
  mergeSuggestions,
  parseCatalogSheet,
  parseGstCell,
  parsePriceCell,
  searchSuggestions,
} from '../lib/catalog';

// ── GST ────────────────────────────────────────────────────

test('lineGst: inclusive takes GST out of the price, exclusive adds it', () => {
  assert.equal(lineGst(11800, 18, 'inclusive'), 1800); // ₹118 incl. 18% → ₹18 GST
  assert.equal(lineGst(10000, 18, 'exclusive'), 1800);
  assert.equal(lineGst(10000, 0, 'inclusive'), 0);
  assert.equal(lineGst(10000, 18, 'none'), 0);
  assert.equal(lineGst(10000, 0.25, 'exclusive'), 25);
});

test('computeBill totals: inclusive keeps the total, exclusive adds GST', () => {
  const lines = [
    { name: 'A', qty: 2, unitPrice: 5900, gstRate: 18 },
    { name: 'B', qty: 1, unitPrice: 10500, gstRate: 5 },
  ];
  const inc = computeBill(lines, 'inclusive');
  assert.equal(inc.subtotal, 22300);
  assert.equal(inc.grandTotal, 22300);
  assert.equal(inc.gstTotal, 1800 + 500);
  const exc = computeBill(lines, 'exclusive');
  assert.equal(exc.gstTotal, 2124 + 525);
  assert.equal(exc.grandTotal, 22300 + 2124 + 525);
  const none = computeBill(lines, 'none');
  assert.equal(none.gstTotal, 0);
  assert.ok(none.items.every((i) => i.gstRate === 0));
});

test('gstSummary groups by rate and splits CGST/SGST, odd paisa to SGST', () => {
  const bill = computeBill(
    [
      { name: 'A', qty: 1, unitPrice: 11800, gstRate: 18 },
      { name: 'B', qty: 1, unitPrice: 101, gstRate: 18 },
      { name: 'C', qty: 1, unitPrice: 5000, gstRate: 0 },
    ],
    'inclusive',
  );
  const rows = gstSummary({ ...bill, gstMode: 'inclusive' });
  assert.equal(rows.length, 2);
  const r18 = rows.find((r) => r.rate === 18)!;
  assert.equal(r18.gst, 1800 + 15);
  assert.equal(r18.cgst + r18.sgst, r18.gst);
  assert.equal(r18.sgst - r18.cgst, 1);
  assert.equal(r18.taxable, 11901 - 1815);
  assert.deepEqual(gstSummary({ items: bill.items, gstMode: undefined, gstTotal: 0 }), []);
  assert.equal(formatRate(0.25), '0.25%');
  assert.equal(formatRate(18), '18%');
});

// ── Sheets ─────────────────────────────────────────────────

test('writeXlsx output reads back with the same cells', async () => {
  const rows = [...SAMPLE_ROWS, ['Tea & "biscuits" <pack>', 10, '5%']];
  const back = await readSpreadsheet(writeXlsx(rows, { widths: [30, 10, 8] }), 'x.xlsx');
  assert.deepEqual(back, rows);
});

/** A deflate-compressed workbook with shared strings and rich text, like Excel writes. */
function excelStyleXlsx(): Uint8Array {
  const files: Record<string, string> = {
    '[Content_Types].xml': '<Types/>',
    'xl/workbook.xml':
      '<workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Prices" sheetId="3" r:id="rId7"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Target="worksheets/sheet3.xml" Id="rId7" Type="x"/></Relationships>',
    'xl/sharedStrings.xml':
      '<sst><si><t>Item</t></si><si><t>MRP (₹)</t></si><si><r><t>GST</t></r><r><t xml:space="preserve"> Rate</t></r></si><si><t>Paracetamol &amp; Co</t><rPh><t>x</t></rPh></si><si><t>18%</t></si></sst>',
    'xl/worksheets/sheet3.xml':
      '<worksheet><sheetData>' +
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>' +
      '<row r="3"><c r="A3" t="s"><v>3</v></c><c r="B3"><v>45.5</v></c><c r="C3" s="2"><v>0.12</v></c></row>' +
      '<row r="4"><c r="A4" t="inlineStr"><is><t>Cough syrup</t></is></c><c r="C4" t="s"><v>4</v></c><c r="B4" t="str"><v>120</v></c></row>' +
      '</sheetData></worksheet>',
  };
  const enc = new TextEncoder();
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = Buffer.from(enc.encode(name));
    const data = deflateRawSync(Buffer.from(enc.encode(text)));
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0);
    h.writeUInt16LE(8, 8);
    h.writeUInt32LE(data.length, 18);
    h.writeUInt16LE(n.length, 26);
    local.push(h, n, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(8, 10);
    c.writeUInt32LE(data.length, 20);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(offset, 42);
    central.push(c, n);
    offset += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...local, cd, end]));
}

test('reads an Excel-style workbook: deflate, shared + rich strings, gaps, % cells', async () => {
  const rows = await readSpreadsheet(excelStyleXlsx(), 'prices.xlsx');
  assert.deepEqual(rows[0], ['Item', 'MRP (₹)', 'GST Rate']);
  assert.deepEqual(rows[1], []);
  assert.deepEqual(rows[2], ['Paracetamol & Co', 45.5, 0.12]);
  const parsed = parseCatalogSheet(rows);
  assert.deepEqual(parsed.items, [
    { name: 'Paracetamol & Co', price: 4550, gst: 12 },
    { name: 'Cough syrup', price: 12000, gst: 18 },
  ]);
  assert.equal(parsed.issues.length, 0);
});

test('old .xls files get a clear message', async () => {
  await assert.rejects(readSpreadsheet(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]), 'a.xls'), /Save As/);
});

test('CSV: quotes, embedded commas/newlines, semicolons, BOM', async () => {
  assert.deepEqual(parseCsv('a,"b,c","d ""e"""\r\n1,,"x\ny"'), [
    ['a', 'b,c', 'd "e"'],
    ['1', null, 'x\ny'],
  ]);
  assert.deepEqual(parseCsv('Name;Price;GST\nTea;10;5'), [
    ['Name', 'Price', 'GST'],
    ['Tea', '10', '5'],
  ]);
  const rows = await readSpreadsheet(new TextEncoder().encode('﻿' + writeCsv(SAMPLE_ROWS)), 's.csv');
  assert.equal(parseCatalogSheet(rows).items.length, 3);
});

// ── Parsing products ───────────────────────────────────────

test('price and GST cells accept the usual ways people type them', () => {
  assert.equal(parsePriceCell('₹1,299.50'), 129950);
  assert.equal(parsePriceCell('Rs. 40'), 4000);
  assert.equal(parsePriceCell('40/-'), 4000);
  assert.equal(parsePriceCell(33.5), 3350);
  assert.equal(parsePriceCell(1.005), null);
  assert.equal(parsePriceCell(-1), null);
  assert.equal(parsePriceCell('abc'), null);
  assert.equal(parseGstCell('18%'), 18);
  assert.equal(parseGstCell(' 5 '), 5);
  assert.equal(parseGstCell(0.18), 18);
  assert.equal(parseGstCell(0.0025), 0.25);
  assert.equal(parseGstCell(0.25), 0.25);
  assert.equal(parseGstCell(null), 0);
  assert.equal(parseGstCell(15), null);
  assert.equal(parseGstCell('GST 40'), 40);
});

test('parseCatalogSheet reports bad rows and de-duplicates by name', () => {
  const parsed = parseCatalogSheet([
    ['Sr', 'Product name', 'GST %', 'Price'],
    [1, 'Tea', 5, 10],
    [2, '', 5, 10],
    [3, 'Sugar', 5, ''],
    [4, 'Salt', 7, 20],
    [],
    [5, '  TEA ', 5, 12],
  ]);
  assert.deepEqual(parsed.items, [{ name: 'TEA', price: 1200, gst: 5 }]);
  assert.equal(parsed.rowsRead, 5);
  assert.deepEqual(
    parsed.issues.map((i) => i.row),
    [3, 4, 5, 7],
  );
});

test('a sheet without a header is read as name, price, GST', () => {
  assert.deepEqual(parseCatalogSheet([['Tea', 10, 5]]).items, [{ name: 'Tea', price: 1000, gst: 5 }]);
});

test('mergeCatalog: merge keeps others, replace drops them, counts are right', () => {
  const old = [
    { name: 'Tea', price: 1000, gst: 5 },
    { name: 'Salt', price: 2000, gst: 0 },
    { name: 'Rice', price: 5000, gst: 5 },
  ];
  const sheet = [
    { name: 'tea', price: 1000, gst: 5 },
    { name: 'Salt', price: 2200, gst: 0 },
    { name: 'Rice', price: 5000, gst: 5 },
    { name: 'Oil', price: 15000, gst: 5 },
  ];
  const m = mergeCatalog(old, sheet, 'merge');
  assert.deepEqual([m.added, m.updated, m.unchanged, m.removed], [1, 2, 1, 0]);
  assert.equal(m.items.length, 4);
  const r = mergeCatalog(old, sheet.slice(1, 2), 'replace');
  assert.deepEqual([r.added, r.updated, r.unchanged, r.removed], [0, 1, 0, 2]);
  assert.equal(r.items.length, 1);
});

// ── Suggestions ────────────────────────────────────────────

test('suggestions: own items override catalogue, ranking prefers prefix + own', () => {
  const list = mergeSuggestions(
    [{ name: 'Dolo 650 Tablet', price: 3000, gst: 12 }],
    [
      { segment: 'Medical', items: [{ name: 'dolo 650 tablet', price: 3350, gst: 12 }, { name: 'Paracetamol (Dolo)', price: 2000, gst: 12 }] },
      { segment: 'Grocery', items: [{ name: 'Dolo cake', price: 100, gst: 18 }] },
    ],
  );
  assert.equal(list.length, 3);
  const res = searchSuggestions(list, 'dolo');
  assert.equal(res[0].name, 'Dolo 650 Tablet');
  assert.equal(res[0].source, 'mine');
  assert.equal(res[0].price, 3000);
  assert.equal(res.at(-1)!.name, 'Paracetamol (Dolo)');
  assert.deepEqual(searchSuggestions(list, '650 dolo').map((s) => s.name), ['Dolo 650 Tablet']);
  assert.deepEqual(searchSuggestions(list, '  '), []);
});

test('itemsToRemember: only new or changed lines', () => {
  const known = mergeSuggestions([], [{ segment: 'S', items: [{ name: 'Tea', price: 1000, gst: 5 }] }]);
  const out = itemsToRemember(
    [
      { name: 'tea', price: 1000, gst: 5 },
      { name: 'Tea ', price: 1100, gst: 5 },
      { name: 'Biscuit', price: 500, gst: 18 },
    ],
    known,
  );
  assert.deepEqual(out, [
    { name: 'Tea', price: 1100, gst: 5 },
    { name: 'Biscuit', price: 500, gst: 18 },
  ]);
});

test('itemDocId is a safe Firestore id', () => {
  assert.equal(itemDocId(' A/B  c '), 'i_a%2Fb%20c');
  assert.equal(itemDocId('..'), 'i_..');
});

// ── GSTIN ──────────────────────────────────────────────────

import { gstinError, normalizeGstin } from '../lib/gstin';

test('GSTIN: optional, normalised, format and checksum checked', () => {
  assert.equal(gstinError(''), null);
  assert.equal(normalizeGstin(' 27aapfu0939f1zv '), '27AAPFU0939F1ZV');
  assert.equal(gstinError('27aapfu0939f1zv'), null); // valid, any case
  assert.equal(gstinError('29AAGCB7383J1Z4'), null);
  assert.match(gstinError('27AAPFU0939F1ZW')!, /typo/); // wrong check char
  assert.match(gstinError('27AAPFU0939F1Z')!, /15 characters/);
  assert.match(gstinError('2XAAPFU0939F1ZV')!, /look like/);
});
