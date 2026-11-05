/**
 * Plans and prices. Prices and plan names are fixed by the product brief;
 * which capability sits in which plan is a working draft — edit it here
 * and the plan cards, the comparison table and the FAQ all follow.
 *
 * There is no subscription or payment system yet. No plan is charged,
 * every plan CTA leads to sign-up, and we will tell users before anything
 * is ever charged.
 *
 * Availability is stated per capability, matching what is actually built:
 *   true    — available now
 *   'app'   — built into the WBill mobile app, which is coming to the
 *             App Store and Google Play
 *   'soon'  — planned, not built yet
 *   false   — not in this plan
 *   string  — a short literal value shown as-is
 */
export type Cell = boolean | 'app' | 'soon' | string;

export type Plan = {
  id: 'free' | 'starter' | 'business' | 'pro';
  name: string;
  price: number;
  blurb: string;
  highlights: Array<{ label: string; status?: 'app' | 'soon' }>;
  recommended?: boolean;
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    blurb: 'Everything you need to replace the paper bill book.',
    highlights: [
      { label: 'Digital bills with automatic numbering' },
      { label: 'Customer records and bill history' },
      { label: 'PDF bills shared on WhatsApp', status: 'app' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    blurb: 'For businesses ready to see their numbers.',
    highlights: [
      { label: 'Everything in Free' },
      { label: 'Sales totals and bill count' },
      { label: 'Saved item list', status: 'soon' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 249,
    blurb: 'For growing businesses that keep records beyond the bill.',
    highlights: [
      { label: 'Everything in Starter' },
      { label: 'Order tracking', status: 'soon' },
      { label: 'Warranty records', status: 'soon' },
    ],
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    blurb: 'For busy businesses that run on insight.',
    highlights: [
      { label: 'Everything in Business' },
      { label: 'Sales trends and top customers' },
      { label: 'Priority support' },
    ],
  },
];

export const comparison: Array<{ group: string; rows: Array<{ label: string; cells: [Cell, Cell, Cell, Cell] }> }> = [
  {
    group: 'Billing',
    rows: [
      { label: 'Digital bills with items, quantity and price', cells: [true, true, true, true] },
      { label: 'Automatic, sequential bill numbers', cells: [true, true, true, true] },
      { label: 'PDF bill with your business details', cells: ['app', 'app', 'app', 'app'] },
      { label: 'Share bills on WhatsApp', cells: ['app', 'app', 'app', 'app'] },
      { label: 'Tax and discount lines', cells: ['soon', 'soon', 'soon', 'soon'] },
      { label: 'Paid and pending status', cells: ['soon', 'soon', 'soon', 'soon'] },
    ],
  },
  {
    group: 'Records',
    rows: [
      { label: 'Customer records and purchase history', cells: [true, true, true, true] },
      { label: 'Saved item list', cells: [false, 'soon', 'soon', 'soon'] },
      { label: 'Order tracking', cells: [false, false, 'soon', 'soon'] },
      { label: 'Warranty records', cells: [false, false, 'soon', 'soon'] },
    ],
  },
  {
    group: 'Insight',
    rows: [
      { label: 'Sales totals and bill count', cells: [false, true, true, true] },
      { label: 'Sales trends and top customers', cells: [false, false, false, true] },
      { label: 'Priority support', cells: [false, false, false, true] },
    ],
  },
  {
    group: 'For your customers',
    rows: [{ label: 'Receiving bills from you', cells: ['Always free', 'Always free', 'Always free', 'Always free'] }],
  },
];
