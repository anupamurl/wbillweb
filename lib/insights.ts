import type { Bill } from './models';

/** Pure functions over the bills already loaded from Firestore — no network, no mock data. */

export type Overview = {
  totalBills: number;
  totalCustomers: number;
  totalRevenue: number;
  billsThisMonth: number;
  revenueThisMonth: number;
};

export function overviewOf(bills: Bill[]): Overview {
  const now = new Date();
  const thisMonth = bills.filter((b) => b.date.getFullYear() === now.getFullYear() && b.date.getMonth() === now.getMonth());
  return {
    totalBills: bills.length,
    totalCustomers: uniqueCustomers(bills).size,
    totalRevenue: bills.reduce((sum, b) => sum + b.grandTotal, 0),
    billsThisMonth: thisMonth.length,
    revenueThisMonth: thisMonth.reduce((sum, b) => sum + b.grandTotal, 0),
  };
}

function customerKey(b: Bill): string {
  return b.customerPhone || `name:${b.customerName.trim().toLowerCase()}`;
}

function uniqueCustomers(bills: Bill[]): Set<string> {
  return new Set(bills.map(customerKey));
}

export type MonthPoint = { label: string; month: number; year: number; revenue: number; bills: number };

/** Last `months` calendar months, oldest first, including months with zero bills. */
export function monthlyTrend(bills: Bill[], months = 6): MonthPoint[] {
  const now = new Date();
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({ label: d.toLocaleDateString('en-IN', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), revenue: 0, bills: 0 });
  }
  for (const b of bills) {
    const p = points.find((pt) => pt.month === b.date.getMonth() && pt.year === b.date.getFullYear());
    if (p) {
      p.revenue += b.grandTotal;
      p.bills += 1;
    }
  }
  return points;
}

export type WeekPoint = { label: string; date: Date; bills: number; revenue: number };

/** Last `days` calendar days, oldest first. */
export function dailyActivity(bills: Bill[], days = 7): WeekPoint[] {
  const points: WeekPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    points.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), date: d, bills: 0, revenue: 0 });
  }
  for (const b of bills) {
    const d = new Date(b.date);
    d.setHours(0, 0, 0, 0);
    const p = points.find((pt) => pt.date.getTime() === d.getTime());
    if (p) {
      p.bills += 1;
      p.revenue += b.grandTotal;
    }
  }
  return points;
}

export type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  billCount: number;
  totalSpent: number;
  lastBillDate: Date;
};

/** One row per customer (matched by phone, falling back to name), newest activity first. */
export function customersOf(bills: Bill[]): CustomerSummary[] {
  const byKey = new Map<string, CustomerSummary>();
  for (const b of bills) {
    const key = customerKey(b);
    const existing = byKey.get(key);
    if (existing) {
      existing.billCount += 1;
      existing.totalSpent += b.grandTotal;
      if (b.date > existing.lastBillDate) existing.lastBillDate = b.date;
      if (!existing.name && b.customerName) existing.name = b.customerName;
    } else {
      byKey.set(key, {
        key,
        name: b.customerName,
        phone: b.customerPhone,
        billCount: 1,
        totalSpent: b.grandTotal,
        lastBillDate: b.date,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => b.lastBillDate.getTime() - a.lastBillDate.getTime());
}

/** Top customers by total spend, most frequently billed first as a tiebreak. */
export function topCustomers(bills: Bill[], limit = 5): CustomerSummary[] {
  return [...customersOf(bills)].sort((a, b) => b.totalSpent - a.totalSpent || b.billCount - a.billCount).slice(0, limit);
}
