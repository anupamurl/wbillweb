'use client';

import Link from 'next/link';
import { useDashboard } from '@/lib/DashboardContext';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import BillRow from '@/components/dashboard/BillRow';
import { formatPaise } from '@/lib/currency';
import { overviewOf } from '@/lib/insights';

export default function OverviewPage() {
  const { shop, bills, error } = useDashboard();
  const overview = overviewOf(bills);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="wb-display text-2xl text-ink sm:text-3xl">{shop?.name ?? 'Overview'}</h1>
          <p className="mt-1 text-sm text-ink-soft">Your business, at a glance.</p>
        </div>
        <Link
          href="/dashboard/bills/new"
          className="wb-btn wb-btn-md bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
        >
          + New bill
        </Link>
      </div>

      {error && <p className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}

      {bills.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No bills yet"
          body="Create your first bill to see it here, with your revenue and customer insights building up as you go."
          ctaLabel="Create your first bill"
          ctaHref="/dashboard/bills/new"
        />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total bills" value={String(overview.totalBills)} icon="receipt" />
            <StatCard label="Total customers" value={String(overview.totalCustomers)} icon="users" />
            <StatCard label="Total revenue" value={formatPaise(overview.totalRevenue)} icon="chart" />
            <StatCard
              label="Bills this month"
              value={String(overview.billsThisMonth)}
              icon="clock"
              hint={formatPaise(overview.revenueThisMonth)}
            />
          </dl>

          <div className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-ink">Recent bills</h2>
              <Link href="/dashboard/bills" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {bills.slice(0, 5).map((bill) => (
                <BillRow key={bill.id} bill={bill} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
