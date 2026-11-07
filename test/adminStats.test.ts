import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customersOf, dailySeries, monthlySeries, pctChange, platformKpis, topItems, userRows } from '../lib/admin/stats';
import type { AdminBill, AdminShop } from '../lib/admin/data';

const DAY = 86_400_000;
const now = Date.now();

function shop(id: string, createdAt: Date | null = new Date()): AdminShop {
  return { id, name: `Shop ${id}`, address: '', phone: '', ownerPhone: '9876543210', nextBillNumber: 1, logo: '', segments: [], gstMode: 'inclusive', gstin: '', createdAt };
}

function bill(shopId: string, daysAgo: number, total: number, extra: Partial<AdminBill> = {}): AdminBill {
  return {
    id: Math.random().toString(36),
    shopId,
    billNumber: 1,
    date: new Date(now - daysAgo * DAY),
    createdAt: null,
    customerName: '',
    customerPhone: '9876543210',
    items: [{ name: 'Charger', qty: 1, unitPrice: total, lineTotal: total, gstRate: 0, gstAmount: 0 }],
    subtotal: total,
    gstTotal: 0,
    gstMode: '',
    grandTotal: total,
    status: 'active',
    createdBy: '',
    createdByName: '',
    ...extra,
  };
}

test('userRows totals each shop and classifies status by last bill', () => {
  const shops = [shop('a'), shop('b'), shop('c'), shop('d')];
  const bills = [bill('a', 1, 10000), bill('a', 2, 30000), bill('b', 15, 5000), bill('c', 60, 2000)];
  const rows = new Map(userRows(shops, bills).map((r) => [r.shop.id, r]));
  assert.equal(rows.get('a')!.bills, 2);
  assert.equal(rows.get('a')!.revenue, 40000);
  assert.equal(rows.get('a')!.avgBill, 20000);
  assert.equal(rows.get('a')!.status, 'active');
  assert.equal(rows.get('b')!.status, 'idle');
  assert.equal(rows.get('c')!.status, 'dormant');
  assert.equal(rows.get('d')!.status, 'new');
  assert.equal(rows.get('d')!.revenue, 0);
});

test('platformKpis sums revenue and counts active shops and customers', () => {
  const shops = [shop('a'), shop('b')];
  const bills = [
    bill('a', 0, 10000),
    bill('a', 0, 10000, { customerPhone: '9000000001' }),
    bill('b', 40, 5000),
  ];
  const k = platformKpis(shops, bills);
  assert.equal(k.users, 2);
  assert.equal(k.bills, 3);
  assert.equal(k.revenue, 25000);
  assert.equal(k.activeUsers7d, 1);
  assert.equal(k.customers, 3); // same phone at two different shops counts twice
  assert.equal(k.billsToday, 2);
});

test('series are fixed-length and oldest first', () => {
  const bills = [bill('a', 0, 10000), bill('a', 0, 5000)];
  const m = monthlySeries(bills, 12);
  assert.equal(m.length, 12);
  assert.equal(m[11].value, 15000);
  assert.equal(m[11].secondary, 2);
  const d = dailySeries(bills, 30);
  assert.equal(d.length, 30);
  assert.equal(d[29].value, 2);
});

test('pctChange handles a zero baseline', () => {
  assert.equal(pctChange(150, 100), 50);
  assert.equal(pctChange(0, 0), 0);
  assert.equal(pctChange(10, 0), null);
});

test('topItems and customersOf merge by name / phone', () => {
  const bills = [
    bill('a', 1, 10000, { customerPhone: '9000000001', customerName: 'Ravi' }),
    bill('a', 2, 20000, { customerPhone: '9000000001', items: [{ name: ' charger ', qty: 2, unitPrice: 10000, lineTotal: 20000, gstRate: 0, gstAmount: 0 }] }),
  ];
  const items = topItems(bills);
  assert.equal(items.length, 1);
  assert.equal(items[0].qty, 3);
  const customers = customersOf(bills);
  assert.equal(customers.length, 1);
  assert.equal(customers[0].bills, 2);
  assert.equal(customers[0].spent, 30000);
  assert.equal(customers[0].name, 'Ravi');
});

test('todayStats counts unique users logged in today, yesterday and over 7 days', async () => {
  const { todayStats, dayKey } = await import('../lib/admin/stats');
  const at = new Date(2026, 10, 7, 15);
  const d = (n: number) => dayKey(new Date(2026, 10, 7 - n));
  const logins = [
    { uid: 'a', day: d(0), at },
    { uid: 'b', day: d(0), at },
    { uid: 'a', day: d(1), at },
    { uid: 'c', day: d(6), at },
    { uid: 'd', day: d(7), at },
  ];
  const s = todayStats([shop('a', new Date(2026, 10, 7, 9))], [bill('a', 0, 500)].map((b) => ({ ...b, date: new Date(2026, 10, 7, 10) })), logins, at);
  assert.equal(s.loginsToday, 2);
  assert.equal(s.loginsYesterday, 1);
  assert.equal(s.logins7d, 3);
  assert.equal(s.billsToday, 1);
  assert.equal(s.revenueToday, 500);
  assert.equal(s.signupsToday, 1);
});

test('dailyActivity buckets logins, bills and sign-ups per day, oldest first', async () => {
  const { dailyActivity, dayKey } = await import('../lib/admin/stats');
  const now = new Date(2026, 10, 7, 15);
  const logins = [
    { uid: 'a', day: dayKey(now), at: now },
    { uid: 'a', day: dayKey(now), at: now },
    { uid: 'b', day: dayKey(now), at: now },
  ];
  const bills = [
    { ...bill('a', 0, 300), date: new Date(2026, 10, 7, 11) },
    { ...bill('b', 0, 200), date: new Date(2026, 10, 6, 11) },
  ];
  const rows = dailyActivity([shop('a', new Date(2026, 10, 6, 8))], bills, logins, 7, now);
  assert.equal(rows.length, 7);
  const last = rows[6];
  assert.equal(last.day, dayKey(now));
  assert.deepEqual([last.logins, last.bills, last.revenue], [2, 1, 300]);
  assert.deepEqual([rows[5].bills, rows[5].signups, rows[5].logins], [1, 1, 0]);
});
