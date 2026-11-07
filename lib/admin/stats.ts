import type { AdminBill, AdminLogin, AdminShop } from './data';

/** Pure aggregations over the admin snapshot. Amounts are paise. */

export type UserRow = {
  shop: AdminShop;
  bills: number;
  revenue: number;
  avgBill: number;
  customers: number;
  lastBillAt: Date | null;
  billsThisMonth: number;
  revenueThisMonth: number;
  status: 'active' | 'idle' | 'new' | 'dormant';
};

const DAY = 86_400_000;

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function groupBillsByShop(bills: AdminBill[]): Map<string, AdminBill[]> {
  const map = new Map<string, AdminBill[]>();
  for (const b of bills) {
    const list = map.get(b.shopId);
    if (list) list.push(b);
    else map.set(b.shopId, [b]);
  }
  return map;
}

function customerKey(b: AdminBill) {
  return b.customerPhone || `name:${b.customerName.trim().toLowerCase()}`;
}

/**
 * active  – billed in the last 7 days
 * idle    – last bill 8–30 days ago
 * dormant – no bill in 30+ days
 * new     – signed up, never billed
 */
function statusOf(lastBillAt: Date | null, now: number): UserRow['status'] {
  if (!lastBillAt) return 'new';
  const age = now - lastBillAt.getTime();
  if (age <= 7 * DAY) return 'active';
  if (age <= 30 * DAY) return 'idle';
  return 'dormant';
}

export function userRows(shops: AdminShop[], bills: AdminBill[]): UserRow[] {
  const byShop = groupBillsByShop(bills);
  const now = Date.now();
  const monthStart = startOfMonth().getTime();
  return shops.map((shop) => {
    const list = byShop.get(shop.id) ?? [];
    const revenue = list.reduce((s, b) => s + b.grandTotal, 0);
    const lastBillAt = list.reduce<Date | null>((m, b) => (!m || b.date > m ? b.date : m), null);
    const month = list.filter((b) => b.date.getTime() >= monthStart);
    return {
      shop,
      bills: list.length,
      revenue,
      avgBill: list.length ? Math.round(revenue / list.length) : 0,
      customers: new Set(list.map(customerKey)).size,
      lastBillAt,
      billsThisMonth: month.length,
      revenueThisMonth: month.reduce((s, b) => s + b.grandTotal, 0),
      status: statusOf(lastBillAt, now),
    };
  });
}

export type PlatformKpis = {
  users: number;
  newUsersThisMonth: number;
  activeUsers7d: number;
  bills: number;
  billsThisMonth: number;
  billsLastMonth: number;
  revenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  avgBill: number;
  customers: number;
  billsToday: number;
  revenueToday: number;
};

export function platformKpis(shops: AdminShop[], bills: AdminBill[]): PlatformKpis {
  const now = new Date();
  const monthStart = startOfMonth(now).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = now.getTime() - 7 * DAY;

  let revenue = 0;
  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  let billsThisMonth = 0;
  let billsLastMonth = 0;
  let billsToday = 0;
  let revenueToday = 0;
  const active = new Set<string>();
  const customers = new Set<string>();

  for (const b of bills) {
    const t = b.date.getTime();
    revenue += b.grandTotal;
    customers.add(`${b.shopId}:${customerKey(b)}`);
    if (t >= monthStart) {
      billsThisMonth += 1;
      revenueThisMonth += b.grandTotal;
    } else if (t >= lastMonthStart) {
      billsLastMonth += 1;
      revenueLastMonth += b.grandTotal;
    }
    if (t >= dayStart) {
      billsToday += 1;
      revenueToday += b.grandTotal;
    }
    if (t >= weekAgo) active.add(b.shopId);
  }

  return {
    users: shops.length,
    newUsersThisMonth: shops.filter((s) => s.createdAt && s.createdAt.getTime() >= monthStart).length,
    activeUsers7d: active.size,
    bills: bills.length,
    billsThisMonth,
    billsLastMonth,
    revenue,
    revenueThisMonth,
    revenueLastMonth,
    avgBill: bills.length ? Math.round(revenue / bills.length) : 0,
    customers: customers.size,
    billsToday,
    revenueToday,
  };
}

export type SeriesPoint = { label: string; value: number; secondary?: number };

/** Billed value and bill count per month, oldest first. */
export function monthlySeries(bills: AdminBill[], months = 12): SeriesPoint[] {
  const now = new Date();
  const points = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), value: 0, secondary: 0 };
  });
  const index = new Map(points.map((p, i) => [p.key, i]));
  for (const b of bills) {
    const i = index.get(`${b.date.getFullYear()}-${b.date.getMonth()}`);
    if (i !== undefined) {
      points[i].value += b.grandTotal;
      points[i].secondary += 1;
    }
  }
  return points.map(({ label, value, secondary }) => ({ label, value, secondary }));
}

/** Bills per day, oldest first. */
export function dailySeries(bills: AdminBill[], days = 30): SeriesPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const points = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * DAY);
    return { t: d.getTime(), label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value: 0, secondary: 0 };
  });
  const first = points[0].t;
  for (const b of bills) {
    const d = new Date(b.date);
    d.setHours(0, 0, 0, 0);
    const i = Math.round((d.getTime() - first) / DAY);
    if (i >= 0 && i < days) {
      points[i].value += 1;
      points[i].secondary += b.grandTotal;
    }
  }
  return points.map(({ label, value, secondary }) => ({ label, value, secondary }));
}

/** New sign-ups per month, oldest first. */
export function signupSeries(shops: AdminShop[], months = 12): SeriesPoint[] {
  const now = new Date();
  const points = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), value: 0 };
  });
  const index = new Map(points.map((p, i) => [p.key, i]));
  for (const s of shops) {
    if (!s.createdAt) continue;
    const i = index.get(`${s.createdAt.getFullYear()}-${s.createdAt.getMonth()}`);
    if (i !== undefined) points[i].value += 1;
  }
  return points.map(({ label, value }) => ({ label, value }));
}

/** Percent change, or null when there is no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function topItems(bills: AdminBill[], limit = 8) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const b of bills) {
    for (const item of b.items) {
      const key = item.name.trim().toLowerCase();
      if (!key) continue;
      const cur = map.get(key) ?? { name: item.name.trim(), qty: 0, revenue: 0 };
      cur.qty += item.qty;
      cur.revenue += item.lineTotal;
      map.set(key, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export type CustomerRow = { key: string; name: string; phone: string; bills: number; spent: number; lastAt: Date };

export function customersOf(bills: AdminBill[]): CustomerRow[] {
  const map = new Map<string, CustomerRow>();
  for (const b of bills) {
    const key = customerKey(b);
    const cur = map.get(key);
    if (cur) {
      cur.bills += 1;
      cur.spent += b.grandTotal;
      if (b.date > cur.lastAt) cur.lastAt = b.date;
      if (!cur.name && b.customerName) cur.name = b.customerName;
    } else {
      map.set(key, { key, name: b.customerName, phone: b.customerPhone, bills: 1, spent: b.grandTotal, lastAt: b.date });
    }
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

/** Local calendar day as YYYY-MM-DD (matches logins doc ids). */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type TodayStats = {
  loginsToday: number;
  loginsYesterday: number;
  logins7d: number;
  billsToday: number;
  billsYesterday: number;
  revenueToday: number;
  revenueYesterday: number;
  signupsToday: number;
  signupsYesterday: number;
};

/** Today vs yesterday, plus unique users who logged in over the last 7 days. */
export function todayStats(shops: AdminShop[], bills: AdminBill[], logins: AdminLogin[], now = new Date()): TodayStats {
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))));
  const users = (day: string) => new Set(logins.filter((l) => l.day === day).map((l) => l.uid)).size;
  const billsOn = (day: string) => bills.filter((b) => dayKey(b.date) === day);
  const signupsOn = (day: string) => shops.filter((s) => s.createdAt && dayKey(s.createdAt) === day).length;
  const bt = billsOn(today);
  const by = billsOn(yesterday);
  return {
    loginsToday: users(today),
    loginsYesterday: users(yesterday),
    logins7d: new Set(logins.filter((l) => weekKeys.has(l.day)).map((l) => l.uid)).size,
    billsToday: bt.length,
    billsYesterday: by.length,
    revenueToday: bt.reduce((s, b) => s + b.grandTotal, 0),
    revenueYesterday: by.reduce((s, b) => s + b.grandTotal, 0),
    signupsToday: signupsOn(today),
    signupsYesterday: signupsOn(yesterday),
  };
}

export type DailyRow = {
  day: string;
  date: Date;
  logins: number;
  signups: number;
  bills: number;
  revenue: number;
  activeShops: number;
};

/** One row per day for the last `days` days, oldest first. */
export function dailyActivity(shops: AdminShop[], bills: AdminBill[], logins: AdminLogin[], days = 30, now = new Date()): DailyRow[] {
  const rows: DailyRow[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - i));
    return { day: dayKey(date), date, logins: 0, signups: 0, bills: 0, revenue: 0, activeShops: 0 };
  });
  const index = new Map(rows.map((r, i) => [r.day, i]));
  const users = rows.map(() => new Set<string>());
  const billing = rows.map(() => new Set<string>());
  for (const l of logins) {
    const i = index.get(l.day);
    if (i === undefined) continue;
    users[i].add(l.uid);
  }
  for (const b of bills) {
    const i = index.get(dayKey(b.date));
    if (i === undefined) continue;
    rows[i].bills += 1;
    rows[i].revenue += b.grandTotal;
    billing[i].add(b.shopId);
  }
  for (const s of shops) {
    const i = s.createdAt ? index.get(dayKey(s.createdAt)) : undefined;
    if (i !== undefined) rows[i].signups += 1;
  }
  rows.forEach((r, i) => {
    r.logins = users[i].size;
    r.activeShops = billing[i].size;
  });
  return rows;
}
