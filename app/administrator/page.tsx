'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { AreaChart, Avatar, Bars, Kpi, PageHeader, Panel, ShareBar, relativeTime, Empty } from '@/components/admin/ui';
import { formatPaise } from '@/lib/currency';
import { formatBillNo } from '@/lib/models';
import { dailySeries, monthlySeries, pctChange, platformKpis, signupSeries, todayStats, topItems, userRows } from '@/lib/admin/stats';
import DailyActivity from '@/components/admin/DailyActivity';

export default function AdminOverviewPage() {
  const { shops, bills, logins, loginsError } = useAdmin();
  const [range, setRange] = useState<'30d' | '12m'>('12m');

  const kpis = useMemo(() => platformKpis(shops, bills), [shops, bills]);
  const today = useMemo(() => todayStats(shops, bills, logins), [shops, bills, logins]);
  const rows = useMemo(() => userRows(shops, bills), [shops, bills]);
  const monthly = useMemo(() => monthlySeries(bills, 12), [bills]);
  const daily = useMemo(() => dailySeries(bills, 30), [bills]);
  const signups = useMemo(() => signupSeries(shops, 12), [shops]);
  const items = useMemo(() => topItems(bills, 6), [bills]);
  const shopName = useMemo(() => new Map(shops.map((s) => [s.id, s.name])), [shops]);

  const topShops = [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const topRevenue = topShops[0]?.revenue || 1;
  const statusCounts = rows.reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { active: 0, idle: 0, dormant: 0, new: 0 } as Record<string, number>,
  );
  const topItemRevenue = items[0]?.revenue || 1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform overview"
        subtitle={`Every shop and bill on WBill · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <Link href="/administrator/users/" className="wb-btn wb-btn-sm wb-btn-primary">
            View all users
          </Link>
        }
      />

      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Today
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            accent
            label="Users logged in today"
            value={loginsError ? '—' : today.loginsToday.toLocaleString('en-IN')}
            icon="users"
            delta={loginsError ? undefined : pctChange(today.loginsToday, today.loginsYesterday)}
            hint={loginsError ? 'Publish rules to enable' : `${today.loginsYesterday} yesterday`}
          />
          <Kpi
            label="Bills generated today"
            value={today.billsToday.toLocaleString('en-IN')}
            icon="receipt"
            delta={pctChange(today.billsToday, today.billsYesterday)}
            hint={`${today.billsYesterday} yesterday`}
          />
          <Kpi
            label="Billed today"
            value={formatPaise(today.revenueToday)}
            icon="sparkle"
            delta={pctChange(today.revenueToday, today.revenueYesterday)}
            hint={`${formatPaise(today.revenueYesterday)} yesterday`}
          />
          <Kpi label="New sign-ups today" value={today.signupsToday.toLocaleString('en-IN')} icon="store" hint={`${today.signupsYesterday} yesterday`} />
        </div>
      </section>

      <DailyActivity shops={shops} bills={bills} logins={logins} loginsError={loginsError} />

      <h2 className="-mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">All time</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi accent label="Total billed (all time)" value={formatPaise(kpis.revenue)} icon="chart" hint={`${kpis.bills.toLocaleString('en-IN')} bills`} />
        <Kpi
          label="Billed this month"
          value={formatPaise(kpis.revenueThisMonth)}
          icon="clock"
          delta={pctChange(kpis.revenueThisMonth, kpis.revenueLastMonth)}
          hint="vs last month"
        />
        <Kpi label="Registered users" value={kpis.users.toLocaleString('en-IN')} icon="users" hint={`+${kpis.newUsersThisMonth} this month`} />
        <Kpi
          label="Shops billing (7 days)"
          value={kpis.activeUsers7d.toLocaleString('en-IN')}
          icon="bolt"
          hint={kpis.users ? `${Math.round((kpis.activeUsers7d / kpis.users) * 100)}% of all users` : undefined}
        />
        <Kpi label="Bills this month" value={kpis.billsThisMonth.toLocaleString('en-IN')} icon="receipt" delta={pctChange(kpis.billsThisMonth, kpis.billsLastMonth)} hint="vs last month" />
        <Kpi label="Average bill value" value={formatPaise(kpis.avgBill)} icon="percent" />
        <Kpi label="End customers served" value={kpis.customers.toLocaleString('en-IN')} icon="phone" hint="unique per shop" />
        <Kpi
          label="Logged in (7 days)"
          value={loginsError ? '—' : today.logins7d.toLocaleString('en-IN')}
          icon="key"
          hint={loginsError ? undefined : kpis.users ? `${Math.round((today.logins7d / kpis.users) * 100)}% of all users` : undefined}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title={range === '12m' ? 'Billed value by month' : 'Bills per day'}
          subtitle={range === '12m' ? 'Last 12 months, all shops' : 'Last 30 days, all shops'}
          action={
            <div className="flex rounded-lg border border-border p-0.5 text-xs">
              {(['12m', '30d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-md px-2.5 py-1 font-medium ${range === r ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'}`}
                >
                  {r === '12m' ? '12 months' : '30 days'}
                </button>
              ))}
            </div>
          }
        >
          {range === '12m' ? (
            <AreaChart points={monthly} format={formatPaise} formatSecondary={(v) => v.toLocaleString('en-IN')} secondaryLabel="bills" />
          ) : (
            <AreaChart points={daily} format={(v) => `${v} bills`} formatSecondary={formatPaise} secondaryLabel="billed" />
          )}
        </Panel>

        <Panel title="User health" subtitle="Based on each shop's last bill">
          <div className="flex flex-col gap-3.5">
            {(
              [
                ['active', 'Active', 'billed in last 7 days', 'bg-success'],
                ['idle', 'Idle', 'last bill 8–30 days ago', 'bg-warning'],
                ['dormant', 'Dormant', 'no bill in 30+ days', 'bg-ink-faint'],
                ['new', 'No bills yet', 'signed up, never billed', 'bg-primary'],
              ] as const
            ).map(([key, label, hint, color]) => (
              <div key={key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="tabular-nums text-ink">{statusCounts[key]}</span>
                </div>
                <p className="mb-1.5 text-xs text-ink-faint">{hint}</p>
                <span className="block h-1.5 overflow-hidden rounded-full bg-ink/5">
                  <span className={`block h-full rounded-full ${color}`} style={{ width: `${kpis.users ? (statusCounts[key] / kpis.users) * 100 : 0}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium text-ink-soft">New sign-ups per month</p>
            <Bars points={signups} format={(v) => `${v} users`} height={90} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Top shops by billed value" flush action={<Link href="/administrator/users/" className="text-xs font-medium text-primary hover:underline">All users</Link>}>
          {topShops.length === 0 ? (
            <Empty title="No shops yet" />
          ) : (
            <ul className="divide-y divide-border">
              {topShops.map((r, i) => (
                <li key={r.shop.id}>
                  <Link href={`/administrator/user/?id=${encodeURIComponent(r.shop.id)}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.03]">
                    <span className="w-4 text-xs tabular-nums text-ink-faint">{i + 1}</span>
                    <Avatar name={r.shop.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-ink">{r.shop.name}</p>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPaise(r.revenue)}</p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ShareBar fraction={r.revenue / topRevenue} />
                        <span className="shrink-0 text-[0.7rem] tabular-nums text-ink-faint">{r.bills} bills</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Live activity" subtitle="Latest bills across the platform" flush action={<Link href="/administrator/bills/" className="text-xs font-medium text-primary hover:underline">All bills</Link>}>
          {bills.length === 0 ? (
            <Empty title="No bills yet" />
          ) : (
            <ul className="divide-y divide-border">
              {bills.slice(0, 7).map((b) => (
                <li key={`${b.shopId}/${b.id}`}>
                  <Link href={`/administrator/user/?id=${encodeURIComponent(b.shopId)}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/[0.03]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{shopName.get(b.shopId) ?? 'Deleted shop'}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-soft">
                        {formatBillNo(b.billNumber)} · {relativeTime(b.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPaise(b.grandTotal)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top items sold" subtitle="By billed value, all shops">
          {items.length === 0 ? (
            <Empty title="No items yet" />
          ) : (
            <ul className="flex flex-col gap-3.5">
              {items.map((it) => (
                <li key={it.name}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-ink">{it.name}</span>
                    <span className="shrink-0 tabular-nums text-ink">{formatPaise(it.revenue)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ShareBar fraction={it.revenue / topItemRevenue} />
                    <span className="shrink-0 text-[0.7rem] tabular-nums text-ink-faint">×{it.qty.toLocaleString('en-IN')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
