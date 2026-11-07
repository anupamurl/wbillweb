import { parseRupeesToPaise } from './currency';
import { GST_RATES, isGstRate } from './gst';
import type { Cell, Rows } from './sheet';

/**
 * Product catalogues: the super admin's per-segment price lists (from an
 * Excel sheet) and each shop's own remembered items. Pure functions only —
 * Firestore access is in lib/segments.ts. Mirrors wbillmobile/lib/core/catalog.dart.
 */

/** One product. `price` is in paise; `gst` a rate from GST_RATES. */
export type CatalogItem = { name: string; price: number; gst: number };

export const MAX_SEGMENT_ITEMS = 5000; // keeps one catalogue doc well under Firestore's 1 MB
export const MAX_ITEM_NAME = 100;
export const MAX_PRICE = 100_000_000_00; // ₹10 crore, in paise

/** "  Dolo  650 " → "Dolo 650". */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

/** Two names are the same product when they match ignoring case and spacing. */
export function itemKey(name: string): string {
  return cleanName(name).toLowerCase();
}

/** Firestore doc id for a shop's own item (ids can't contain '/', or be '.'/'..'). */
export function itemDocId(name: string): string {
  return `i_${encodeURIComponent(itemKey(name))}`;
}

export const SAMPLE_ROWS: Rows = [
  ['Product name', 'Price', 'GST %'],
  ['Dolo 650 Tablet (strip of 15)', 33.5, 12],
  ['Amul Butter 500 g', 285, 5],
  ['Phone charger 20W', 899, 18],
];

// ── Reading a sheet ────────────────────────────────────────

export type RowIssue = { row: number; message: string };
export type ParsedSheet = {
  items: CatalogItem[];
  issues: RowIssue[];
  /** Data rows that were read (excludes the header and blank rows). */
  rowsRead: number;
};

const isBlank = (c: Cell) => c === null || (typeof c === 'string' && c.trim() === '');
const cellText = (c: Cell) => (c === null ? '' : String(c).trim());

/** Rupees in a cell ("₹1,299.50", "Rs. 40", 33.5) → paise, or null. */
export function parsePriceCell(c: Cell): number | null {
  if (typeof c === 'number') {
    if (!Number.isFinite(c) || c < 0) return null;
    const paise = Math.round(c * 100);
    return Math.abs(paise - c * 100) < 1e-6 ? paise : null; // more than 2 decimals
  }
  if (typeof c !== 'string') return null;
  const s = c.replace(/₹|rs\.?|inr|\/-/gi, '').replace(/[\s,]/g, '');
  return s ? parseRupeesToPaise(s) : null;
}

/** "18", "18%", 18, or 0.18 (a cell formatted as %) → 18; blank → 0; else null. */
export function parseGstCell(c: Cell): number | null {
  if (isBlank(c)) return 0;
  let n: number;
  if (typeof c === 'number') n = c;
  else if (typeof c === 'string') {
    const s = c.replace(/%|\s|gst/gi, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    n = Number(s);
  } else return null;
  if (isGstRate(n)) return n;
  const pct = Math.round(n * 10000) / 100; // 0.18 → 18, 0.0025 → 0.25
  return n > 0 && n < 1 && isGstRate(pct) ? pct : null;
}

const NAME_HEADER = /product|item|name|description|particular/i;
const PRICE_HEADER = /price|rate|mrp|amount|cost|₹/i;
const GST_HEADER = /gst|tax|vat/i;

/**
 * Finds the columns from a header row (any order, any of the usual
 * names) within the first 10 rows; with no header, assumes A, B, C.
 */
function findColumns(rows: Rows): { start: number; name: number; price: number; gst: number } {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const texts = (rows[r] ?? []).map(cellText);
    const gst = texts.findIndex((t) => GST_HEADER.test(t));
    const name = texts.findIndex((t, i) => i !== gst && NAME_HEADER.test(t));
    const price = texts.findIndex((t, i) => i !== gst && i !== name && PRICE_HEADER.test(t));
    if (name >= 0 && price >= 0) return { start: r + 1, name, price, gst };
  }
  return { start: 0, name: 0, price: 1, gst: 2 };
}

/** Turns spreadsheet rows into validated products, reporting every row it skips. */
export function parseCatalogSheet(rows: Rows): ParsedSheet {
  const col = findColumns(rows);
  const issues: RowIssue[] = [];
  const byKey = new Map<string, { item: CatalogItem; row: number }>();
  let rowsRead = 0;
  for (let r = col.start; r < rows.length; r++) {
    const cells = rows[r] ?? [];
    if (cells.every(isBlank)) continue;
    rowsRead++;
    const rowNo = r + 1; // as Excel shows it
    const name = cleanName(cellText(cells[col.name] ?? null));
    if (!name) {
      issues.push({ row: rowNo, message: 'Product name is empty.' });
      continue;
    }
    if (name.length > MAX_ITEM_NAME) {
      issues.push({ row: rowNo, message: `Product name is longer than ${MAX_ITEM_NAME} characters.` });
      continue;
    }
    const priceCell = cells[col.price] ?? null;
    const price = parsePriceCell(priceCell);
    if (price === null || price > MAX_PRICE) {
      issues.push({ row: rowNo, message: isBlank(priceCell) ? 'Price is empty.' : `Price "${cellText(priceCell)}" is not a valid amount.` });
      continue;
    }
    const gstCell = col.gst >= 0 ? (cells[col.gst] ?? null) : null;
    const gst = parseGstCell(gstCell);
    if (gst === null) {
      issues.push({ row: rowNo, message: `GST "${cellText(gstCell)}" is not a GST rate (use ${GST_RATES.join(', ')}).` });
      continue;
    }
    const key = itemKey(name);
    const dup = byKey.get(key);
    if (dup) issues.push({ row: rowNo, message: `Same product as row ${dup.row}; this later row is used.` });
    byKey.set(key, { item: { name, price, gst }, row: rowNo });
  }
  const items = [...byKey.values()].map((v) => v.item);
  if (items.length > MAX_SEGMENT_ITEMS) {
    issues.push({ row: 0, message: `A segment can hold at most ${MAX_SEGMENT_ITEMS.toLocaleString('en-IN')} products; only the first ${MAX_SEGMENT_ITEMS.toLocaleString('en-IN')} are kept.` });
    items.length = MAX_SEGMENT_ITEMS;
  }
  return { items, issues, rowsRead };
}

// ── Merging an upload into a segment ───────────────────────

export type MergeResult = {
  items: CatalogItem[];
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
};

/**
 * merge   — products in the sheet are added or updated (matched by name);
 *           products not in the sheet are kept.
 * replace — the segment becomes exactly the sheet.
 */
export function mergeCatalog(existing: CatalogItem[], incoming: CatalogItem[], mode: 'merge' | 'replace'): MergeResult {
  const old = new Map(existing.map((i) => [itemKey(i.name), i]));
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const i of incoming) {
    const prev = old.get(itemKey(i.name));
    if (!prev) added++;
    else if (prev.price !== i.price || prev.gst !== i.gst || prev.name !== i.name) updated++;
    else unchanged++;
  }
  if (mode === 'replace') {
    const incomingKeys = new Set(incoming.map((i) => itemKey(i.name)));
    const removed = existing.filter((i) => !incomingKeys.has(itemKey(i.name))).length;
    return { items: incoming.slice(0, MAX_SEGMENT_ITEMS), added, updated, unchanged, removed };
  }
  const merged = new Map(old);
  for (const i of incoming) merged.set(itemKey(i.name), i);
  return { items: [...merged.values()].slice(0, MAX_SEGMENT_ITEMS), added, updated, unchanged, removed: 0 };
}

// ── Suggestions while billing ──────────────────────────────

export type Suggestion = CatalogItem & { source: 'mine' | 'catalog'; segment?: string };

/**
 * One list from the shop's own items and its segments' catalogues. A shop's
 * own item wins over a catalogue product with the same name (it holds the
 * shop's price); the first segment wins between segments.
 */
export function mergeSuggestions(mine: CatalogItem[], catalogs: { segment: string; items: CatalogItem[] }[]): Suggestion[] {
  const out = new Map<string, Suggestion>();
  for (const c of catalogs) {
    for (const i of c.items) {
      const k = itemKey(i.name);
      if (!out.has(k)) out.set(k, { ...i, source: 'catalog', segment: c.segment });
    }
  }
  for (const i of mine) out.set(itemKey(i.name), { ...i, source: 'mine' });
  return [...out.values()];
}

/**
 * Best matches for what's typed: whole-name prefix first, then a word that
 * starts with it, then anywhere; the shop's own items before catalogue ones.
 * Every typed word must appear ("dolo 650" finds "Dolo 650 Tablet").
 */
export function searchSuggestions(list: Suggestion[], query: string, limit = 8): Suggestion[] {
  const q = itemKey(query);
  if (!q) return [];
  const words = q.split(' ');
  const scored: { s: Suggestion; score: number }[] = [];
  for (const s of list) {
    const name = itemKey(s.name);
    if (!words.every((w) => name.includes(w))) continue;
    let score = name.startsWith(q) ? 0 : (' ' + name).includes(' ' + words[0]) ? 1 : 2;
    if (name === q) score = -1;
    scored.push({ s, score: score * 2 + (s.source === 'mine' ? 0 : 1) });
  }
  scored.sort((a, b) => a.score - b.score || a.s.name.length - b.s.name.length || a.s.name.localeCompare(b.s.name));
  return scored.slice(0, limit).map((x) => x.s);
}

/** The lines on a saved bill that the shop should remember (new or changed). */
export function itemsToRemember(lines: CatalogItem[], known: Suggestion[]): CatalogItem[] {
  const byKey = new Map(known.map((s) => [itemKey(s.name), s]));
  const out = new Map<string, CatalogItem>();
  for (const l of lines) {
    const name = cleanName(l.name);
    if (!name || name.length > MAX_ITEM_NAME) continue;
    const k = itemKey(name);
    const prev = byKey.get(k);
    if (prev && prev.price === l.price && prev.gst === l.gst) continue;
    out.set(k, { name, price: l.price, gst: l.gst });
  }
  return [...out.values()];
}
