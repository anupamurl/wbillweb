export const REQUEST_TYPES = [
  { value: 'access', label: 'See or get a copy of my data' },
  { value: 'correction', label: 'Correct my data' },
  { value: 'erasure', label: 'Erase my data' },
  { value: 'withdraw', label: 'Withdraw my consent' },
  { value: 'nominate', label: 'Nominate someone to act for me' },
  { value: 'shop_bill', label: 'My details are on a shop’s bill' },
  { value: 'grievance', label: 'Raise a grievance' },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]['value'];
export type RequestDraft = { type: RequestType; name: string; contact: string; details: string; shopName: string };

/** Checked in the browser, and again by the security rules. Returns the problem, or ''. */
export function requestError(d: RequestDraft): string {
  if (!d.name.trim()) return 'Enter your name.';
  const contact = d.contact.trim();
  const digits = contact.replace(/[\s-]/g, '').replace(/^(\+91|91)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) return 'Enter a valid 10-digit mobile number or email address.';
  if (!d.details.trim()) return 'Tell us what you would like us to do.';
  if (d.type === 'shop_bill' && !d.shopName.trim()) return 'Enter the shop’s name.';
  return '';
}
