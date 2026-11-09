import { ERASURE_NOTICE_HOURS, INACTIVE_YEARS, RETENTION_DAYS } from './legal';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/** The first moment a closed account's data may be erased. */
export function retainUntil(requestedAt: Date): Date {
  return new Date(requestedAt.getTime() + RETENTION_DAYS * DAY);
}

export function isErasureDue(requestedAt: Date | null, now = new Date()): boolean {
  return requestedAt !== null && retainUntil(requestedAt).getTime() <= now.getTime();
}

/** The most recent of the dates given, or null when there are none. */
export function lastActivity(dates: (Date | null | undefined)[]): Date | null {
  return dates.reduce<Date | null>((latest, d) => (d && (!latest || d > latest) ? d : latest), null);
}

export function isInactive(last: Date | null, now = new Date()): boolean {
  if (!last) return false;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - INACTIVE_YEARS);
  return last < cutoff;
}

/** True once an inactive owner has had the full warning period. */
export function noticeHasRun(notifiedAt: Date | null, now = new Date()): boolean {
  return notifiedAt !== null && now.getTime() - notifiedAt.getTime() >= ERASURE_NOTICE_HOURS * HOUR;
}

/** Day id (YYYY-MM-DD) before which login records may be erased. */
export function loginCutoffDay(now = new Date()): string {
  const d = new Date(now.getTime() - RETENTION_DAYS * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
