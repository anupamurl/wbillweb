/**
 * Demonstration data for the product mockups on the marketing site.
 *
 * None of this is a real business, customer or result. Every mockup that
 * renders it carries a visible "Demo data" label. The shape follows the
 * real product exactly: a bill is a customer (name + phone), line items
 * (name, quantity, unit price) and a total, numbered WB-0001 onwards; the
 * share message is the one the WBill app writes.
 */

export const demoBusiness = {
  name: 'Meridian Store',
  place: 'Pune',
  phone: '+91 98220 ••••5',
};

export const demoCustomer = {
  name: 'Priya Sharma',
  phone: '98765 •••10',
};

export type DemoLine = { name: string; qty: number; price: number };

export const demoLines: DemoLine[] = [
  { name: 'Ceramic dinner set', qty: 1, price: 1450 },
  { name: 'Cotton bath towel', qty: 2, price: 380 },
  { name: 'Gift wrapping', qty: 1, price: 50 },
];

export const demoBill = {
  number: 'WB-0142',
  date: '3 Nov 2026',
  time: '6:42 pm',
  lines: demoLines,
  total: demoLines.reduce((sum, line) => sum + line.qty * line.price, 0),
};

/** Mirrors S.shareMessage in the mobile app. */
export const demoShareText = (total: string) =>
  [`Thank you for shopping at ${demoBusiness.name}.`, `Bill ${demoBill.number} · Total ${total}`];

/** A customer's history as the business sees it in WBill: bills over time. */
export const demoHistory = [
  { number: 'WB-0142', date: '3 Nov 2026', items: 3, total: 2260 },
  { number: 'WB-0117', date: '18 Oct 2026', items: 1, total: 899 },
  { number: 'WB-0094', date: '2 Oct 2026', items: 4, total: 3120 },
  { number: 'WB-0061', date: '9 Sep 2026', items: 2, total: 640 },
  { number: 'WB-0023', date: '14 Aug 2026', items: 1, total: 1999 },
];

export const demoRecentBills = [
  { number: 'WB-0142', customer: 'Priya Sharma', items: 3, total: 2260, when: 'Today' },
  { number: 'WB-0141', customer: 'Arjun Mehta', items: 1, total: 499, when: 'Today' },
  { number: 'WB-0140', customer: 'Fatima Khan', items: 5, total: 4385, when: 'Yesterday' },
  { number: 'WB-0139', customer: 'Rahul Verma', items: 2, total: 1180, when: 'Yesterday' },
];

/** Six months of revenue for the insights mockup (₹). */
export const demoMonths = [
  { label: 'Jun', revenue: 84200, bills: 61 },
  { label: 'Jul', revenue: 91800, bills: 66 },
  { label: 'Aug', revenue: 88400, bills: 63 },
  { label: 'Sep', revenue: 102600, bills: 74 },
  { label: 'Oct', revenue: 126900, bills: 88 },
  { label: 'Nov', revenue: 118300, bills: 79 },
];

export const demoWeek = [
  { label: 'Mon', bills: 9 },
  { label: 'Tue', bills: 12 },
  { label: 'Wed', bills: 8 },
  { label: 'Thu', bills: 14 },
  { label: 'Fri', bills: 17 },
  { label: 'Sat', bills: 23 },
  { label: 'Sun', bills: 11 },
];

export const demoTopCustomers = [
  { name: 'Fatima Khan', bills: 9, spent: 18420 },
  { name: 'Priya Sharma', bills: 5, spent: 8918 },
  { name: 'Arjun Mehta', bills: 7, spent: 7640 },
  { name: 'Rahul Verma', bills: 4, spent: 5210 },
];

export const demoOverview = {
  bills: 431,
  customers: 186,
  revenue: 612200,
  billsThisMonth: 79,
  revenueThisMonth: 118300,
};

export function inr(value: number, paise = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: paise ? 2 : 0,
    maximumFractionDigits: paise ? 2 : 0,
  }).format(value);
}
