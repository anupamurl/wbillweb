'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import BillsTable from '@/components/admin/BillsTable';
import { AreaChart, Avatar, BlockedBadge, Empty, Kpi, Panel, SearchInput, ShareBar, StatusBadge, ToolbarButton, fmtDate, relativeTime } from '@/components/admin/ui';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { formatBillNo } from '@/lib/models';
import { customersOf, monthlySeries, pctChange, topItems, userRows } from '@/lib/admin/stats';
import { downloadCsv, isoDate, paiseToRupees } from '@/lib/admin/csv';
import BlockButton from '@/components/admin/BlockButton';
import DeleteUserButton from '@/components/admin/DeleteUserButton';

export default function AdminUserPage() {
  return (
    <Suspense fallback={null}>
      <UserDetail />
    </Suspense>
  );
}

function UserDetail() {
  const id = useSearchParams().get('id') ?? '';
  const router = useRouter();
  const { shops, bills, blocked } = useAdmin();
  const [tab, setTab] = useState<'bills' | 'customers' | 'items'>('bills');
  const [q, setQ] = useState('');

  const shop = shops.find((s) => s.id === id) ?? null;
  const shopBills = useMemo(() => bills.filter((b) => b.shopId === id), [bills, id]);
  const row = useMemo(() => (shop ? userRows([shop], shopBills)[0] : null), [shop, shopBills]);
  const monthly = useMemo(() => monthlySeries(shopBills, 12), [shopBills]);
  const customers = useMemo(() => customersOf(shopBills), [shopBills]);
  const items = useMemo(() => topItems(shopBills, 50), [shopBills]);

  const rank = useMemo(() => {
    const sorted = userRows(shops, bills).sort((a, b) => b.revenue - a.revenue);
    return sorted.findIndex((r) => r.shop.id === id) + 1;
  }, [shops, bills, id]);

  const filteredBills = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return shopBills;
    const digits = needle.replace(/\D/g, '');
    return shopBills.filter(
      (b) =>
        formatBillNo(b.billNumber).toLowerCase().includes(needle) ||
        b.customerName.toLowerCase().includes(needle) ||
        (digits.length >= 3 && b.customerPhone.includes(digits)) ||
        b.items.some((i) => i.name.toLowerCase().includes(needle)),
    );
  }, [shopBills, q]);

  if (!shop || !row) {
    return (
      <Panel>
        <Empty title="User not found" body={id ? `No shop exists for uid ${id}. It may have been deleted.` : 'No user was selected.'} />
        <div className="text-center">
          <Link href="/administrator/users/" className="text-sm font-medium text-primary hover:underline">
            ← Back to users
          </Link>
        </div>
      </Panel>
    );
  }

  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueLastMonth = shopBills.filter((b) => b.date >= lastMonthStart && b.date < monthStart).reduce((s, b) => s + b.grandTotal, 0);
  const largest = shopBills.reduce((m, b) => Math.max(m, b.grandTotal), 0);
  const firstBill = shopBills.length ? shopBills[shopBills.length - 1].date : null;
  const repeatCustomers = customers.filter((c) => c.bills > 1).length;
  const topCustomerSpend = customers[0]?.spent || 1;
  const topItemRevenue = items[0]?.revenue || 1;

  function exportBills() {
    downloadCsv(
      `wbill-${shop!.name.replace(/[^\w]+/g, '-').toLowerCase()}-bills-${isoDate(new Date())}.csv`,
      ['Bill no.', 'Date', 'Customer name', 'Customer phone', 'Items', 'Item details', 'Subtotal (INR)', 'Grand total (INR)'],
      filteredBills.map((b) => [
        formatBillNo(b.billNumber),
        b.date.toISOString(),
        b.customerName,
        b.customerPhone,
        b.items.length,
        b.items.map((i) => `${i.name} x${i.qty} @ ${paiseToRupees(i.unitPrice)}`).join('; '),
        paiseToRupees(b.subtotal),
        paiseToRupees(b.grandTotal),
      ]),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/administrator/users/" className="hover:text-ink">
          Users
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{shop.name}</span>
      </nav>

      {/* Profile header */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={shop.name} size={56} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="wb-display text-2xl text-ink">{shop.name}</h1>
                <StatusBadge status={row.status} />
                {blocked.has(shop.id) && <BlockedBadge />}
                {rank > 0 && <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[0.7rem] font-medium text-ink-soft">#{rank} by billed value</span>}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{shop.address || 'No address on file'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ToolbarButton onClick={exportBills} icon="document">
              Export bills CSV
            </ToolbarButton>
            <BlockButton uid={shop.id} name={shop.name} blocked={blocked.has(shop.id)} />
            <DeleteUserButton uid={shop.id} name={shop.name} bills={shopBills.length} onDeleted={() => router.replace('/administrator/users/')} />
          </div>
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Owner login phone" value={formatPhone(shop.ownerPhone) || shop.ownerPhone || '—'} />
          <Info label="Shop phone" value={shop.phone || '—'} />
          <Info label="Joined" value={`${fmtDate(shop.createdAt, true)}`} hint={shop.createdAt ? relativeTime(shop.createdAt) : undefined} />
          <Info label="Last bill" value={fmtDate(row.lastBillAt, true)} hint={row.lastBillAt ? relativeTime(row.lastBillAt) : 'never'} />
          <Info label="First bill" value={fmtDate(firstBill)} />
          <Info label="Next bill number" value={formatBillNo(shop.nextBillNumber)} />
          <Info label="User ID (uid)" value={shop.id} mono />
          <Info label="Firestore path" value={`shops/${shop.id}`} mono />
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Total billed" value={formatPaise(row.revenue)} icon="chart" hint={`${row.bills} bills`} />
        <Kpi label="This month" value={formatPaise(row.revenueThisMonth)} icon="clock" delta={pctChange(row.revenueThisMonth, revenueLastMonth)} hint="vs last month" />
        <Kpi label="Average bill" value={formatPaise(row.avgBill)} icon="percent" hint={`largest ${formatPaise(largest)}`} />
        <Kpi label="Customers" value={row.customers.toLocaleString('en-IN')} icon="users" hint={`${repeatCustomers} repeat`} />
      </div>

      <Panel title="Billed value by month" subtitle="Last 12 months">
        <AreaChart points={monthly} format={formatPaise} formatSecondary={(v) => v.toLocaleString('en-IN')} secondaryLabel="bills" height={200} />
      </Panel>

      <Panel flush>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" className="flex gap-1">
            {(
              [
                ['bills', `Bills (${shopBills.length})`],
                ['customers', `Customers (${customers.length})`],
                ['items', `Items (${items.length})`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                type="button"
                onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === k ? 'bg-ink text-canvas' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'bills' && <SearchInput value={q} onChange={setQ} placeholder="Search bill no., customer, item…" />}
        </div>

        {tab === 'bills' && <BillsTable bills={filteredBills} />}

        {tab === 'customers' &&
          (customers.length === 0 ? (
            <Empty title="No customers yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-canvas text-xs text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Bills</th>
                    <th className="px-4 py-3 text-left font-medium">Share</th>
                    <th className="px-4 py-3 text-right font-medium">Total spent</th>
                    <th className="px-4 py-3 text-right font-medium">Last visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.key}>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{c.name || 'Unnamed'}</span>
                        <span className="block text-xs text-ink-soft">{formatPhone(c.phone) || c.phone || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{c.bills}</td>
                      <td className="w-40 px-4 py-3">
                        <ShareBar fraction={c.spent / topCustomerSpend} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{formatPaise(c.spent)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-ink-soft">{relativeTime(c.lastAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === 'items' &&
          (items.length === 0 ? (
            <Empty title="No items yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-canvas text-xs text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Item</th>
                    <th className="px-4 py-3 text-right font-medium">Qty sold</th>
                    <th className="px-4 py-3 text-left font-medium">Share</th>
                    <th className="px-4 py-3 text-right font-medium">Billed value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it) => (
                    <tr key={it.name}>
                      <td className="px-4 py-3 font-medium text-ink">{it.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">{it.qty.toLocaleString('en-IN')}</td>
                      <td className="w-40 px-4 py-3">
                        <ShareBar fraction={it.revenue / topItemRevenue} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">{formatPaise(it.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </Panel>
    </div>
  );
}

function Info({ label, value, hint, mono }: { label: string; value: string; hint?: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className={`mt-0.5 truncate text-ink ${mono ? 'font-mono text-xs' : 'font-medium'}`} title={value}>
        {value}
      </dd>
      {hint && <dd className="text-xs text-ink-faint">{hint}</dd>}
    </div>
  );
}
