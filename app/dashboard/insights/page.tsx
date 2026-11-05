'use client';

import { useDashboard } from '@/lib/DashboardContext';
import EmptyState from '@/components/dashboard/EmptyState';
import BarChart from '@/components/dashboard/BarChart';
import { dailyActivity, monthlyTrend, topCustomers } from '@/lib/insights';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';

export default function InsightsPage() {
  const { bills } = useDashboard();

  if (bills.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">Business insights</h1>
        <EmptyState
          icon="chart"
          title="Nothing to analyse yet"
          body="Save a few bills and your revenue trends, busiest days and top customers will build up here automatically."
          ctaLabel="Create your first bill"
          ctaHref="/dashboard/bills/new"
        />
      </div>
    );
  }

  const months = monthlyTrend(bills, 6);
  const days = dailyActivity(bills, 7);
  const top = topCustomers(bills, 5);
  const maxTop = Math.max(1, ...top.map((c) => c.totalSpent));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="wb-display text-2xl text-ink sm:text-3xl">Business insights</h1>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-ink-soft">Revenue, last 6 months</p>
          <div className="mt-4">
            <BarChart
              points={months.map((m) => ({ label: m.label, value: m.revenue }))}
              formatValue={formatPaise}
              ariaLabel="Monthly revenue"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-ink-soft">Bills, last 6 months</p>
          <div className="mt-4">
            <BarChart
              points={months.map((m) => ({ label: m.label, value: m.bills }))}
              formatValue={(v) => `${v} bill${v === 1 ? '' : 's'}`}
              ariaLabel="Monthly bill count"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-ink-soft">Billing activity, last 7 days</p>
          <div className="mt-4">
            <BarChart
              points={days.map((d) => ({ label: d.label, value: d.bills }))}
              formatValue={(v) => `${v} bill${v === 1 ? '' : 's'}`}
              ariaLabel="Daily bill count"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-ink-soft">Most frequently billed customers</p>
          <ul className="mt-4 space-y-4">
            {top.map((c, index) => (
              <li key={c.key}>
                <div className="flex justify-between text-sm">
                  <span className="truncate text-ink">{c.name || formatPhone(c.phone) || 'Walk-in customer'}</span>
                  <span className="shrink-0 tabular-nums text-ink-soft">{formatPaise(c.totalSpent)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-canvas">
                  <div
                    className="wb-barx h-full rounded-full bg-primary"
                    style={{ width: `${(c.totalSpent / maxTop) * 100}%`, '--wb-delay': `${120 + index * 80}ms` } as React.CSSProperties}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
