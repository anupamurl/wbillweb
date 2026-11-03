/**
 * Demonstration data for the landing page mockups. None of this is a real
 * business, customer or result — every component that renders it shows a
 * "Demo data" badge. GST is computed per line, as the app computes it.
 */

export const demoShop = {
  name: 'Kumar Electronics',
  area: 'Lajpat Nagar, New Delhi',
  gstin: '07ABCDE1234F1Z5',
};

export const demoCustomer = {
  name: 'Riya Mehta',
  phone: '+91 98••• ••210',
};

export const demoInvoiceNumber = 'INV-2026-0148';
export const demoInvoiceDate = '3 Nov 2026';

const items = [
  { name: '1.5 Ton 5-star inverter split AC', detail: 'Serial SN-AC15-77821', qty: 1, rate: 38990, taxRatePercent: 18 },
  { name: 'Voltage stabiliser 4 kVA', detail: 'Serial SN-ST4-10392', qty: 1, rate: 2890, taxRatePercent: 18 },
  { name: 'Installation and copper kit', detail: '3 m copper pipe', qty: 1, rate: 1500, taxRatePercent: 18 },
];

export const demoInvoice = (() => {
  const rows = items.map((item) => {
    const lineTotal = item.qty * item.rate;
    return { ...item, lineTotal, taxAmount: Math.round((lineTotal * item.taxRatePercent) / 100) };
  });
  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
  const tax = rows.reduce((sum, row) => sum + row.taxAmount, 0);
  return { rows, subtotal, tax, total: subtotal + tax };
})();

/** Warranty records are measured against this fixed date, so the page renders the same everywhere. */
export const demoToday = new Date('2026-11-03T00:00:00Z');

export const demoWarranties = [
  { product: '55-inch 4K smart LED TV', serial: 'SN-TV55-22910087', purchased: '2026-03-12', months: 24 },
  { product: 'Double-door refrigerator 340 L', serial: 'SN-RF340-55102', purchased: '2025-12-02', months: 12 },
  { product: 'Front-load washing machine 8 kg', serial: 'SN-WM8-90311', purchased: '2024-09-18', months: 24 },
];

export function warrantyState(purchased: string, months: number) {
  const start = new Date(`${purchased}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + months);
  const total = end.getTime() - start.getTime();
  const elapsed = Math.min(Math.max(demoToday.getTime() - start.getTime(), 0), total);
  const daysLeft = Math.round((end.getTime() - demoToday.getTime()) / 86_400_000);
  const status: 'active' | 'expiring' | 'expired' =
    daysLeft < 0 ? 'expired' : daysLeft <= 60 ? 'expiring' : 'active';
  return { start, end, progress: elapsed / total, daysLeft, status };
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const demoRevenue = [
  { label: 'Dec', value: 312000 },
  { label: 'Jan', value: 268000 },
  { label: 'Feb', value: 245000 },
  { label: 'Mar', value: 356000 },
  { label: 'Apr', value: 418000 },
  { label: 'May', value: 497000 },
  { label: 'Jun', value: 452000 },
  { label: 'Jul', value: 331000 },
  { label: 'Aug', value: 364000 },
  { label: 'Sep', value: 402000 },
  { label: 'Oct', value: 538000 },
  { label: 'Nov', value: 482300 },
];

export const demoTopProducts = [
  { name: 'Split ACs', share: 0.34 },
  { name: 'Smart TVs', share: 0.24 },
  { name: 'Refrigerators', share: 0.18 },
  { name: 'Smartphones', share: 0.14 },
];

export const demoKpis = {
  revenue: 482300,
  bills: 214,
  repeatPercent: 38,
  averageBill: 2254,
};
