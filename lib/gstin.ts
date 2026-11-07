/**
 * GSTIN (GST Identification Number): 15 characters —
 * 2-digit state code · 10-character PAN · entity number · 'Z' · check character.
 * Mirrors wbillmobile/lib/core/gstin.dart; the format is re-checked in firestore.rules.
 */

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** "27 aapfu0939f1zv " → "27AAPFU0939F1ZV". */
export function normalizeGstin(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

/** The check character GSTN computes from the first 14 characters. */
function checkChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const product = CHARS.indexOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHARS[(36 - (sum % 36)) % 36];
}

/** '' is fine (GSTIN is optional); otherwise an error message, or null when valid. */
export function gstinError(input: string): string | null {
  const g = normalizeGstin(input);
  if (!g) return null;
  if (g.length !== 15) return 'A GSTIN has 15 characters, like 27AAPFU0939F1ZV.';
  if (!GSTIN_PATTERN.test(g)) return 'That doesn’t look like a GSTIN. Check it against your GST certificate.';
  if (checkChar(g.slice(0, 14)) !== g[14]) return 'This GSTIN has a typo (its last character doesn’t match). Check it against your GST certificate.';
  return null;
}
