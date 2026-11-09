/**
 * Phone sign-in is India-only: Firebase SMS is enabled for +91 alone, and
 * bills store customers as 10-digit Indian mobiles.
 */
export const countries = [{ code: 'IN', dial: '+91', name: 'India', digits: [10, 10] }] as const;

export type CountryCode = (typeof countries)[number]['code'];

/** Strips everything but digits, and a leading 0 trunk prefix. */
export function cleanNumber(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^0+/, '');
}

/**
 * Returns the number in E.164 (+919876543210) or an error message. Firebase
 * re-validates on its side; this only catches typos before an SMS is spent.
 */
export function toE164(countryCode: CountryCode, raw: string): { ok: true; e164: string } | { ok: false; error: string } {
  const country = countries.find((c) => c.code === countryCode) ?? countries[0];
  let digits = cleanNumber(raw);
  // People often paste "+91 98765 43210" or "919876543210".
  const dialDigits = country.dial.slice(1);
  if (digits.length > country.digits[1] && digits.startsWith(dialDigits)) digits = digits.slice(dialDigits.length);
  if (!digits) return { ok: false, error: 'Enter your mobile number.' };
  if (digits.length < country.digits[0] || digits.length > country.digits[1]) {
    return { ok: false, error: `Enter a ${country.digits[0]}-digit ${country.name} mobile number.` };
  }
  if (country.code === 'IN' && !/^[6-9]/.test(digits)) {
    return { ok: false, error: 'Indian mobile numbers start with 6, 7, 8 or 9.' };
  }
  return { ok: true, e164: `${country.dial}${digits}` };
}

/** 10-digit Indian mobile, the format bills store for customers. */
export function isIndianMobile(digits: string): boolean {
  return /^[6-9][0-9]{9}$/.test(digits);
}

/** "+919876543210" → "98765 43210"; other numbers are returned as given. */
export function formatPhone(e164OrDigits: string | null | undefined): string {
  if (!e164OrDigits) return '';
  const d = e164OrDigits.startsWith('+91') ? e164OrDigits.slice(3) : e164OrDigits;
  if (/^\d{10}$/.test(d)) return `${d.slice(0, 5)} ${d.slice(5)}`;
  return e164OrDigits;
}

/** 98765 43210 → ••••••3210, for screens that shouldn't show the full number. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `••••••${digits.slice(-4)}` : '';
}

/** Priya Sharma → P••• S••• */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]}•••`)
    .join(' ');
}
