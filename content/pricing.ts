/**
 * Launch pricing. Prices are fixed by the product brief; which capability
 * sits in which plan is a working draft — edit it here and both the plan
 * cards and the comparison table follow.
 *
 * There is no subscription or payment system yet, so the page takes no
 * payment and offers no yearly billing: every plan CTA joins early access.
 */
export type Cell = boolean | 'soon' | string;

export type Plan = {
  id: 'free' | 'starter' | 'business' | 'pro';
  name: string;
  price: number;
  blurb: string;
  highlights: Array<{ label: string; soon?: boolean }>;
  recommended?: boolean;
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    blurb: 'Try digital bills at your own counter.',
    highlights: [{ label: 'GST and non-GST bills' }, { label: 'PDF and WhatsApp sharing' }, { label: 'Customer records' }],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    blurb: 'For a shop moving off paper for good.',
    highlights: [{ label: 'Everything in Free' }, { label: 'Saved product catalogue' }, { label: 'Sales analytics: totals' }],
  },
  {
    id: 'business',
    name: 'Business',
    price: 249,
    blurb: 'For stores that sell on warranty.',
    highlights: [{ label: 'Everything in Starter' }, { label: 'Warranty tracking', soon: true }, { label: 'Order tracking', soon: true }],
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    blurb: 'For busy stores that live by the numbers.',
    highlights: [{ label: 'Everything in Business' }, { label: 'Sales analytics: trends', soon: true }, { label: 'Priority support' }],
  },
];

export const comparison: Array<{ group: string; rows: Array<{ label: string; cells: [Cell, Cell, Cell, Cell] }> }> = [
  {
    group: 'Billing',
    rows: [
      { label: 'GST and non-GST bills', cells: [true, true, true, true] },
      { label: 'Branded PDF bills', cells: [true, true, true, true] },
      { label: 'Share on WhatsApp', cells: [true, true, true, true] },
      { label: 'Paid, pending and overdue status', cells: [true, true, true, true] },
    ],
  },
  {
    group: 'Records',
    rows: [
      { label: 'Customer records and bill search', cells: [true, true, true, true] },
      { label: 'Saved product catalogue', cells: [false, true, true, true] },
      { label: 'Warranty tracking', cells: [false, false, 'soon', 'soon'] },
      { label: 'Order tracking', cells: [false, false, 'soon', 'soon'] },
    ],
  },
  {
    group: 'Insight',
    rows: [
      { label: 'Sales analytics: totals and bill count', cells: [false, true, true, true] },
      { label: 'Sales analytics: trends and top products', cells: [false, false, false, 'soon'] },
      { label: 'Priority support', cells: [false, false, false, true] },
    ],
  },
  {
    group: 'For your customers',
    rows: [{ label: 'Digital receipt access', cells: ['Always free', 'Always free', 'Always free', 'Always free'] }],
  },
];
