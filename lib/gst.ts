/**
 * GST maths for bills. Mirrors wbillmobile/lib/core/gst.dart — change both.
 *
 * Money is always integer paise. Rates are percentages (18 = 18%). Tax is
 * worked out per line and rounded to the paisa, so the lines always add up
 * to the bill's GST total exactly.
 *
 *   inclusive — the price already includes GST (most retail). The total
 *               doesn't change; GST is taken out of it for the summary.
 *   exclusive — GST is added on top of the price.
 *   none      — the shop doesn't charge GST; no tax is shown.
 */

/**
 * Rates a product may carry. 0/5/18/40 are the slabs since the Sept 2025
 * reform; 12 and 28 stay for older price lists; 0.25 and 3 are the special
 * rates (rough diamonds, gold/silver). Keep in sync with firestore.rules.
 */
export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28, 40] as const;

export type GstMode = 'inclusive' | 'exclusive' | 'none';
export const GST_MODES: GstMode[] = ['inclusive', 'exclusive', 'none'];
export const DEFAULT_GST_MODE: GstMode = 'inclusive';

export const GST_MODE_LABELS: Record<GstMode, { title: string; body: string }> = {
  inclusive: { title: 'Prices include GST', body: 'The price is what the customer pays. GST is shown inside the total.' },
  exclusive: { title: 'Add GST on top', body: 'GST is added to the price, so the customer pays price + GST.' },
  none: { title: "Don't show GST", body: 'For shops not registered for GST. Bills show no tax.' },
};

export function isGstRate(value: unknown): value is number {
  return typeof value === 'number' && (GST_RATES as readonly number[]).includes(value);
}

export function asGstMode(value: unknown): GstMode {
  return value === 'inclusive' || value === 'exclusive' || value === 'none' ? value : DEFAULT_GST_MODE;
}

/** "18%", "0.25%", "0.125%" (half of 0.25 for CGST/SGST). */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 1000) / 1000}%`;
}

/** GST in paise on one line whose total (qty × price) is `lineTotal`. */
export function lineGst(lineTotal: number, rate: number, mode: GstMode): number {
  const bp = Math.round(rate * 100); // basis points: avoids float error on 0.25%
  if (mode === 'none' || bp <= 0 || lineTotal <= 0) return 0;
  if (mode === 'inclusive') return lineTotal - Math.round((lineTotal * 10000) / (10000 + bp));
  return Math.round((lineTotal * bp) / 10000);
}

export type PricedLine = { name: string; qty: number; unitPrice: number; gstRate: number };
export type TaxedLine = PricedLine & { lineTotal: number; gstAmount: number };

/** Line totals, GST and the bill totals for a set of lines under a shop's mode. */
export function computeBill(lines: PricedLine[], mode: GstMode) {
  const items: TaxedLine[] = lines.map((l) => {
    const gstRate = mode === 'none' ? 0 : l.gstRate;
    const lineTotal = l.qty * l.unitPrice;
    return { ...l, gstRate, lineTotal, gstAmount: lineGst(lineTotal, gstRate, mode) };
  });
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const gstTotal = items.reduce((s, i) => s + i.gstAmount, 0);
  const grandTotal = mode === 'exclusive' ? subtotal + gstTotal : subtotal;
  return { items, subtotal, gstTotal, grandTotal };
}

export type GstRow = { rate: number; taxable: number; cgst: number; sgst: number; gst: number };

/**
 * The tax summary printed under a bill: one row per rate, taxable value
 * and the CGST/SGST halves (intra-state supply; an odd paisa goes to SGST).
 * Empty when the bill carries no GST (old bills, 'none' shops, all 0%).
 */
export function gstSummary(bill: { items: { lineTotal: number; gstRate?: number; gstAmount?: number }[]; gstMode?: GstMode | ''; gstTotal?: number }): GstRow[] {
  if (!bill.gstMode || bill.gstMode === 'none' || !bill.gstTotal) return [];
  const byRate = new Map<number, GstRow>();
  for (const i of bill.items) {
    const rate = i.gstRate ?? 0;
    const gst = i.gstAmount ?? 0;
    const taxable = bill.gstMode === 'inclusive' ? i.lineTotal - gst : i.lineTotal;
    const row = byRate.get(rate) ?? { rate, taxable: 0, cgst: 0, sgst: 0, gst: 0 };
    row.taxable += taxable;
    row.gst += gst;
    byRate.set(rate, row);
  }
  return [...byRate.values()]
    .filter((r) => r.rate > 0 || r.taxable > 0)
    .sort((a, b) => a.rate - b.rate)
    .map((r) => {
      const cgst = Math.floor(r.gst / 2);
      return { ...r, cgst, sgst: r.gst - cgst };
    });
}
