import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customersOf, dailyActivity, monthlyTrend, overviewOf, topCustomers } from '../lib/insights';
import type { Bill } from '../lib/models';

function bill(partial: Partial<Bill> & { date: Date }): Bill {
  return {
    id: Math.random().toString(36),
    billNumber: 1,
    customerName: '',
    customerPhone: '9876543210',
    items: [{ name: 'Item', qty: 1, unitPrice: 10000, lineTotal: 10000, gstRate: 0, gstAmount: 0 }],
    subtotal: 10000,
    gstTotal: 0,
    gstMode: '',
    grandTotal: 10000,
    status: 'active',
    createdBy: '',
    createdByName: '',
    ...partial,
  };
}

test('overviewOf counts bills, unique customers and revenue', () => {
  const now = new Date();
  const bills = [
    bill({ date: now, customerPhone: '9876543210', grandTotal: 10000 }),
    bill({ date: now, customerPhone: '9876543210', grandTotal: 20000 }), // same customer
    bill({ date: now, customerPhone: '9123456789', grandTotal: 5000 }),
  ];
  const overview = overviewOf(bills);
  assert.equal(overview.totalBills, 3);
  assert.equal(overview.totalCustomers, 2);
  assert.equal(overview.totalRevenue, 35000);
  assert.equal(overview.billsThisMonth, 3);
  assert.equal(overview.revenueThisMonth, 35000);
});

test('overviewOf excludes bills from other months from "this month"', () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const bills = [bill({ date: now, grandTotal: 1000 }), bill({ date: lastMonth, grandTotal: 2000 })];
  const overview = overviewOf(bills);
  assert.equal(overview.totalBills, 2);
  assert.equal(overview.billsThisMonth, 1);
  assert.equal(overview.revenueThisMonth, 1000);
});

test('overviewOf on an empty list returns zeros, never NaN or throws', () => {
  const overview = overviewOf([]);
  assert.deepEqual(overview, { totalBills: 0, totalCustomers: 0, totalRevenue: 0, billsThisMonth: 0, revenueThisMonth: 0 });
});

test('monthlyTrend returns exactly `months` points, oldest first, ending this month', () => {
  const points = monthlyTrend([], 6);
  assert.equal(points.length, 6);
  const now = new Date();
  assert.equal(points[5].month, now.getMonth());
  assert.equal(points[5].year, now.getFullYear());
});

test('monthlyTrend buckets a bill into its calendar month', () => {
  const now = new Date();
  const bills = [bill({ date: now, grandTotal: 500 })];
  const points = monthlyTrend(bills, 3);
  const thisMonthPoint = points[points.length - 1];
  assert.equal(thisMonthPoint.bills, 1);
  assert.equal(thisMonthPoint.revenue, 500);
  // every other bucket stays at zero
  assert.equal(points.slice(0, -1).every((p) => p.bills === 0), true);
});

test('dailyActivity returns exactly `days` points ending today', () => {
  const points = dailyActivity([], 7);
  assert.equal(points.length, 7);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  assert.equal(points[6].date.getTime(), today.getTime());
});

test('customersOf merges bills by phone number, keeping a name if one was given', () => {
  const bills = [
    bill({ date: new Date(2026, 0, 1), customerPhone: '9876543210', customerName: '', grandTotal: 100 }),
    bill({ date: new Date(2026, 0, 5), customerPhone: '9876543210', customerName: 'Ramesh', grandTotal: 200 }),
  ];
  const customers = customersOf(bills);
  assert.equal(customers.length, 1);
  assert.equal(customers[0].name, 'Ramesh');
  assert.equal(customers[0].billCount, 2);
  assert.equal(customers[0].totalSpent, 300);
  assert.equal(customers[0].lastBillDate.getTime(), new Date(2026, 0, 5).getTime());
});

test('customersOf treats bills with no phone and different names as different customers', () => {
  const bills = [
    bill({ date: new Date(), customerPhone: '', customerName: 'Alice' }),
    bill({ date: new Date(), customerPhone: '', customerName: 'Bob' }),
  ];
  assert.equal(customersOf(bills).length, 2);
});

test('topCustomers sorts by total spend, most frequent as the tiebreak', () => {
  const bills = [
    bill({ date: new Date(), customerPhone: '1111111111', grandTotal: 1000 }),
    bill({ date: new Date(), customerPhone: '2222222222', grandTotal: 5000 }),
    bill({ date: new Date(), customerPhone: '2222222222', grandTotal: 100 }), // pushes total up but still under none
  ];
  const top = topCustomers(bills, 5);
  assert.equal(top[0].phone, '2222222222');
  assert.equal(top[0].totalSpent, 5100);
});

test('topCustomers respects the limit', () => {
  const bills = Array.from({ length: 10 }, (_, i) => bill({ date: new Date(), customerPhone: `900000000${i}`, grandTotal: i + 1 }));
  assert.equal(topCustomers(bills, 3).length, 3);
});
