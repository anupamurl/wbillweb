const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatInr(value: number): string {
  return formatter.format(value);
}

/** Mirrors wbillmobile/lib/core/money.dart so bills look identical on web and in the app. */
const paiseFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12345 → "₹123.45" */
export function formatPaise(paise: number): string {
  return paiseFormatter.format(paise / 100);
}

/** "123.45" → 12345. Returns null for empty, invalid, or more than 2 decimal places. */
export function parseRupeesToPaise(input: string): number | null {
  const s = input.trim().replace(/,/g, '');
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  const [rupeesPart, fracPart = ''] = s.split('.');
  const rupees = Number(rupeesPart);
  const frac = Number(fracPart.padEnd(2, '0'));
  return rupees * 100 + frac;
}
