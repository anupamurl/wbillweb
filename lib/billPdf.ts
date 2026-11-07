'use client';

import type { jsPDF as JsPDF } from 'jspdf';
import { amountInWords } from './amountInWords';
import { formatPaise } from './currency';
import { formatRate, gstSummary } from './gst';
import { logoSrc } from './logos';
import { formatBillNo, type Bill, type Shop } from './models';

/**
 * The bill PDF. Same layout as wbillmobile/lib/features/bill/bill_pdf.dart
 * so a customer gets the same bill from the website or the app — change both.
 *
 * A5 portrait (reads well on a phone, prints cleanly). Top to bottom:
 * accent bar · logo + shop / bill number · summary card (billed to, date,
 * total) · items table (header repeats per page) · amount in words + total ·
 * thank-you · footer with page numbers on every page.
 *
 * jsPDF and the fonts (~1.2 MB) load on first use only. Noto Sans is needed
 * because the built-in PDF fonts have no ₹ glyph.
 */

const PRIMARY = '#0F62FE';
const INK = '#161616';
const BODY = '#393939';
const MUTED = '#6F6F6F';
const HAIR = '#E0E0E0';
const TINT = '#F4F5F7';
const WHITE = '#FFFFFF';

const THANK_YOU = 'Thank you for your purchase!';
const FOOTER = 'Computer-generated bill · Made with WBill · wbill.app';

let fontCache: Promise<[string, string]> | undefined;

function loadFonts(): Promise<[string, string]> {
  fontCache ??= Promise.all(['/fonts/NotoSans-Regular.ttf', '/fonts/NotoSans-Bold.ttf'].map(fetchBase64)) as Promise<[string, string]>;
  fontCache.catch(() => (fontCache = undefined));
  return fontCache;
}

/**
 * Warms jsPDF and the fonts so a later Share click builds the PDF fast
 * enough to keep the browser's "user just clicked" permission for the
 * share sheet. Safe to call repeatedly.
 */
export function preloadBillPdf(): void {
  void import('jspdf').catch(() => {});
  void loadFonts().catch(() => {});
}

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Any logo (preset SVG or uploaded image) as a PNG data URL plus its aspect ratio. */
async function logoAsPng(logo: string): Promise<{ data: string; ratio: number } | null> {
  const src = logoSrc(logo);
  if (!src) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = src;
    });
    const w = img.naturalWidth || 64;
    const h = img.naturalHeight || 64;
    const scale = 176 / Math.max(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), ratio: w / h };
  } catch {
    return null; // A broken logo shouldn't stop the bill.
  }
}

function displayMobile(digits: string): string {
  return /^\d{10}$/.test(digits) ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

type Logo = { data: string; ratio: number } | null;
type Weight = 'normal' | 'bold';

/** `preloadedLogo` skips the browser-only logo rasterising (used by tests). */
export async function buildBillPdf(shop: Shop, bill: Bill, preloadedLogo?: Logo): Promise<Blob> {
  const [{ jsPDF }, [regular, bold], logo] = await Promise.all([
    import('jspdf'),
    loadFonts(),
    preloadedLogo === undefined ? logoAsPng(shop.logo) : Promise.resolve(preloadedLogo),
  ]);
  const billNo = formatBillNo(bill.billNumber);
  const dateText = bill.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const doc: JsPDF = new jsPDF({ unit: 'pt', format: 'a5', orientation: 'portrait' });
  doc.addFileToVFS('NotoSans-Regular.ttf', regular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', bold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  doc.setProperties({ title: `${shop.name} ${billNo}`, author: shop.name, creator: 'WBill' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 32;
  const right = pageW - M;
  const contentW = right - M;
  const limit = pageH - M - 30; // content stops above the footer

  const font = (size: number, weight: Weight = 'normal', color = INK) => {
    doc.setFont('NotoSans', weight);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };
  /** Draws one line whose top edge is at `top`; returns the y below it. */
  const text = (
    str: string,
    x: number,
    top: number,
    size: number,
    weight: Weight = 'normal',
    color = INK,
    opts: { align?: 'left' | 'right' | 'center'; spacing?: number; lineHeight?: number } = {},
  ) => {
    font(size, weight, color);
    const spacing = opts.spacing ?? 0;
    const baseline = top + size * 0.8;
    if (spacing) {
      // jsPDF mis-aligns right-aligned text with charSpace, so place it by hand.
      const w = doc.getTextWidth(str) + spacing * (str.length - 1);
      const x0 = opts.align === 'right' ? x - w : opts.align === 'center' ? x - w / 2 : x;
      doc.text(str, x0, baseline, { charSpace: spacing });
    } else {
      doc.text(str, x, baseline, { align: opts.align ?? 'left' });
    }
    return top + size * (opts.lineHeight ?? 1.35);
  };
  const wrap = (str: string, width: number, size: number, weight: Weight = 'normal') => {
    font(size, weight);
    return doc.splitTextToSize(str, width) as string[];
  };
  const para = (str: string, x: number, top: number, width: number, size: number, weight: Weight, color: string, lineHeight = 1.4) => {
    let y = top;
    for (const line of wrap(str, width, size, weight)) y = text(line, x, y, size, weight, color, { lineHeight });
    return y;
  };
  const LABEL = 6.8;
  const label = (str: string, x: number, top: number, align: 'left' | 'right' = 'left') =>
    text(str.toUpperCase(), x, top, LABEL, 'bold', MUTED, { align, spacing: 0.9, lineHeight: 1.6 });
  const hline = (y: number, color = HAIR, width = 0.6) => {
    doc.setDrawColor(color);
    doc.setLineWidth(width);
    doc.line(M, y, right, y);
  };

  // ── Header: logo + shop | BILL + number ─────────────────
  const top = 30;
  const logoBox = 46;
  let textX = M;
  if (logo) {
    const w = logo.ratio >= 1 ? logoBox : logoBox * logo.ratio;
    const h = logo.ratio >= 1 ? logoBox / logo.ratio : logoBox;
    doc.addImage(logo.data, 'PNG', M + (logoBox - w) / 2, top + (logoBox - h) / 2, w, h);
    textX = M + logoBox + 12;
  }
  const shopW = right - 118 - 12 - textX;
  let ly = para(shop.name, textX, top + (logo ? 3 : 0), shopW, 14, 'bold', INK, 1.25) + 2;
  if (shop.address) ly = para(shop.address, textX, ly, shopW, 8.3, 'normal', MUTED, 1.45);
  if (shop.phone) ly = text(`Ph: ${shop.phone}`, textX, ly, 8.3, 'normal', MUTED, { lineHeight: 1.45 });
  if (shop.gstin) ly = text(`GSTIN: ${shop.gstin}`, textX, ly, 8.3, 'bold', BODY, { lineHeight: 1.45 });

  let ry = label('Bill', right, top + 1, 'right');
  ry = text(billNo, right, ry, 16, 'bold', INK, { align: 'right', lineHeight: 1.3 });

  let y = Math.max(ly, ry, logo ? top + logoBox : top) + 18;

  // ── Summary card: billed to · date · total ───────────────
  const pad = 14;
  const hasName = Boolean(bill.customerName);
  const cardH = pad + LABEL * 1.6 + 2 + 10.5 * 1.35 + (hasName ? 8.3 * 1.45 : 0) + pad - 4;
  doc.setFillColor(TINT);
  doc.roundedRect(M, y, contentW, cardH, 8, 8, 'F');
  const col2 = M + contentW * 0.5;
  const col3 = M + contentW * 0.74;
  doc.setDrawColor(WHITE);
  doc.setLineWidth(1.2);
  doc.line(col2, y + 10, col2, y + cardH - 10);
  doc.line(col3, y + 10, col3, y + cardH - 10);

  const cy = y + pad;
  const vy = label('Billed to', M + pad, cy) + 2;
  if (hasName) {
    const name = wrap(bill.customerName, col2 - M - pad * 2, 10.5, 'bold')[0];
    text(displayMobile(bill.customerPhone), M + pad, text(name, M + pad, vy, 10.5, 'bold', INK), 8.3, 'normal', BODY);
  } else {
    text(displayMobile(bill.customerPhone), M + pad, vy, 10.5, 'bold', INK);
  }
  text(dateText, col2 + pad, label('Date', col2 + pad, cy) + 2, 10.5, 'bold', INK);
  text(formatPaise(bill.grandTotal), right - pad, label('Total', right - pad, cy, 'right') + 2, 10.5, 'bold', PRIMARY, { align: 'right' });
  y += cardH + 22;

  // ── Items table (header repeats on every page) ───────────
  const colW = [30, 0, 34, 68, 80];
  colW[1] = contentW - colW[0] - colW[2] - colW[3] - colW[4];
  const colX = [M];
  for (let i = 1; i < colW.length; i++) colX[i] = colX[i - 1] + colW[i - 1];
  const cp = 8;
  const size = 8.8;
  const rowLine = size * 1.4;
  const rowPad = 7.5;

  // Totals block geometry, needed up front so the last item row is never
  // separated from the totals (no lonely "Total" on its own page).
  const totalsW = 182;
  const tx = right - totalsW;
  const words = wrap(amountInWords(bill.grandTotal), tx - M - 24, 8.3);
  const boxH = 36;
  // GST: one CGST and one SGST line per rate, between subtotal and total.
  const gstRows = gstSummary(bill);
  const gstLines = gstRows.flatMap((r) => [
    { label: `CGST ${formatRate(r.rate / 2)}`, value: r.cgst },
    { label: `SGST ${formatRate(r.rate / 2)}`, value: r.sgst },
  ]);
  const TAX_LINE = 13;
  const taxH = gstLines.length * TAX_LINE;
  const totalsH = 14 + Math.max(18 + taxH + boxH, LABEL * 1.6 + words.length * 8.3 * 1.45) + 32 + 30;

  const tableHeader = () => {
    const h = 22;
    doc.setFillColor(TINT);
    doc.roundedRect(M, y, contentW, h, 4, 4, 'F');
    const ty = y + (h - LABEL) / 2 - 0.5;
    label('#', colX[0] + cp, ty);
    label('Item', colX[1] + cp, ty);
    label('Qty', colX[2] + colW[2] - cp, ty, 'right');
    label('Rate', colX[3] + colW[3] - cp, ty, 'right');
    label('Amount', colX[4] + colW[4] - cp, ty, 'right');
    y += h;
  };
  const newPage = () => {
    doc.addPage();
    y = M;
  };

  tableHeader();
  bill.items.forEach((item, i) => {
    const lines = wrap(item.name, colW[1] - cp * 2, size);
    const gstNote = gstRows.length ? `GST ${formatRate(item.gstRate)}` : '';
    const rowH = rowPad * 2 + size + (lines.length - 1) * rowLine + (gstNote ? 6.8 * 1.45 : 0);
    const isLast = i === bill.items.length - 1;
    if (y + rowH + (isLast ? totalsH : 0) > limit) {
      newPage();
      tableHeader();
    }
    const ty = y + rowPad;
    text(String(i + 1), colX[0] + cp, ty, size, 'normal', MUTED);
    lines.forEach((line, k) => text(line, colX[1] + cp, ty + k * rowLine, size, 'normal', INK));
    if (gstNote) text(gstNote, colX[1] + cp, ty + lines.length * rowLine - 1, 6.8, 'normal', MUTED);
    text(String(item.qty), colX[2] + colW[2] - cp, ty, size, 'normal', BODY, { align: 'right' });
    text(formatPaise(item.unitPrice), colX[3] + colW[3] - cp, ty, size, 'normal', BODY, { align: 'right' });
    text(formatPaise(item.lineTotal), colX[4] + colW[4] - cp, ty, size, 'bold', INK, { align: 'right' });
    y += rowH;
    hline(y);
  });

  // ── Amount in words | subtotal + total ───────────────────
  y += 14;
  if (y + totalsH - 14 > limit) newPage(); // only when a single row overflows a page

  const itemCount = bill.items.reduce((n, i) => n + i.qty, 0);
  const items = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  if (gstRows.length && bill.gstMode === 'inclusive') {
    text(`Taxable value · ${items}`, tx + 12, y, 8.3, 'normal', MUTED);
    text(formatPaise(bill.subtotal - bill.gstTotal), right - 12, y, 8.3, 'normal', BODY, { align: 'right' });
  } else {
    text(`Subtotal · ${items}`, tx + 12, y, 8.3, 'normal', MUTED);
    text(formatPaise(bill.subtotal || bill.grandTotal), right - 12, y, 8.3, 'normal', BODY, { align: 'right' });
  }
  gstLines.forEach((g, k) => {
    const gy = y + (k + 1) * TAX_LINE;
    text(g.label, tx + 12, gy, 8.3, 'normal', MUTED);
    text(formatPaise(g.value), right - 12, gy, 8.3, 'normal', BODY, { align: 'right' });
  });
  const boxY = y + 18 + taxH;
  doc.setFillColor(PRIMARY);
  doc.roundedRect(tx, boxY, totalsW, boxH, 7, 7, 'F');
  text('Total', tx + 12, boxY + (boxH - 10) / 2 - 1, 10, 'bold', WHITE);
  text(formatPaise(bill.grandTotal), right - 12, boxY + (boxH - 13.5) / 2 - 1, 13.5, 'bold', WHITE, { align: 'right' });

  let wy = label('Amount in words', M, y);
  for (const line of words) wy = text(line, M, wy, 8.3, 'normal', BODY, { lineHeight: 1.45 });

  y = Math.max(boxY + boxH, wy) + 32;

  // ── Thank you ────────────────────────────────────────────
  text(THANK_YOU, pageW / 2, y, 10, 'bold', INK, { align: 'center' });
  text(`We hope to see you again at ${shop.name}.`, pageW / 2, y + 15, 8.3, 'normal', MUTED, { align: 'center' });

  // ── Every page: accent bar + footer ──────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(PRIMARY);
    doc.rect(0, 0, pageW, 4, 'F');
    const fy = pageH - M + 2;
    hline(fy - 10);
    text(FOOTER, M, fy - 2, 6.8, 'normal', MUTED);
    text(pages > 1 ? `${billNo} · Page ${p} of ${pages}` : billNo, right, fy - 2, 6.8, 'normal', MUTED, { align: 'right' });
  }

  return doc.output('blob');
}

