/**
 * Demonstration data for the landing page mockups. None of this is a real
 * business, customer or result — every component that renders it shows a
 * "Demo data" badge. GST is computed per line, as the app computes it.
 */

export const demoShop = {
  name: 'Sharma Hardware Store',
  area: 'Malviya Nagar, Jaipur',
  /** No GSTIN: the hero shows a plain (non-GST) bill — digital billing first, GST optional. */
  gstin: '',
};

export const demoCustomer = {
  name: 'Ramesh Kumar',
  phone: '+91 98••• ••210',
};

export const demoInvoiceNumber = 'BILL-0142';
export const demoInvoiceDate = '3 Nov 2026';

/** A "mixed" bill: shop items and a labour line on one bill, so shops and trades both see themselves. */
const items = [
  { name: 'MCB switch, 16A', detail: '2 × ₹180', qty: 2, rate: 180, taxRatePercent: 0 },
  { name: 'Wire, 1.5 mm', detail: '10 metre × ₹25', qty: 10, rate: 25, taxRatePercent: 0 },
  { name: 'Fitting charge (labour)', detail: 'Service', qty: 1, rate: 300, taxRatePercent: 0 },
];

export const demoDiscount = 30;

export const demoInvoice = (() => {
  const rows = items.map((item) => {
    const lineTotal = item.qty * item.rate;
    return { ...item, lineTotal, taxAmount: Math.round((lineTotal * item.taxRatePercent) / 100) };
  });
  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
  const tax = rows.reduce((sum, row) => sum + row.taxAmount, 0);
  return { rows, subtotal, discount: demoDiscount, tax, total: subtotal - demoDiscount + tax };
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
  { label: 'Dec', value: 142000 },
  { label: 'Jan', value: 128000 },
  { label: 'Feb', value: 119000 },
  { label: 'Mar', value: 151000 },
  { label: 'Apr', value: 163000 },
  { label: 'May', value: 171000 },
  { label: 'Jun', value: 158000 },
  { label: 'Jul', value: 139000 },
  { label: 'Aug', value: 147000 },
  { label: 'Sep', value: 156000 },
  { label: 'Oct', value: 198000 },
  { label: 'Nov', value: 176400 },
];

export const demoTopProducts = [
  { name: 'Electrical items', share: 0.32 },
  { name: 'Plumbing items', share: 0.24 },
  { name: 'Paint and tools', share: 0.19 },
  { name: 'Fitting and labour', share: 0.15 },
];

export const demoKpis = {
  revenue: 176400,
  bills: 312,
  repeatPercent: 41,
  averageBill: 565,
};
