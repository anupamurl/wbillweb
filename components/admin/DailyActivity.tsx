'use client';

import { useMemo, useState } from 'react';
import { formatPaise } from '@/lib/currency';
import { downloadCsv, paiseToRupees } from '@/lib/admin/csv';
import { dailyActivity, type DailyRow } from '@/lib/admin/stats';
import type { AdminBill, AdminLogin, AdminShop } from '@/lib/admin/data';
import { AreaChart, Bars, Panel } from './ui';

type Metric = 'logins' | 'bills' | 'revenue' | 'signups';
type View = 'chart' | 'table';
type Range = 7 | 30 | 90;

const metrics: { key: Metric; label: string }[] = [
  { key: 'logins', label: 'Logins' },
  { key: 'bills', label: 'Bills' },
  { key: 'revenue', label: 'Billed value' },
  { key: 'signups', label: 'Sign-ups' },
];

const count = (v: number) => v.toLocaleString('en-IN');

/** Day-by-day platform activity, as a chart or a table. */
export default function DailyActivity({
  shops,
  bills,
  logins,
  loginsError,
}: {
  shops: AdminShop[];
  bills: AdminBill[];
  logins: AdminLogin[];
  loginsError: string | null;
}) {
  const [metric, setMetric] = useState<Metric>('logins');
  const [view, setView] = useState<View>('chart');
  const [range, setRange] = useState<Range>(30);

  const rows = useMemo(() => dailyActivity(shops, bills, logins, range), [shops, bills, logins, range]);
  const label = (r: DailyRow) => r.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const totals = rows.reduce(
    (t, r) => ({ signups: t.signups + r.signups, bills: t.bills + r.bills, revenue: t.revenue + r.revenue }),
    { signups: 0, bills: 0, revenue: 0 },
  );
  const uniqueLoggedIn = useMemo(() => {
    const days = new Set(rows.map((r) => r.day));
    return new Set(logins.filter((l) => days.has(l.day)).map((l) => l.uid)).size;
  }, [rows, logins]);

  function exportCsv() {
    downloadCsv(
      `wbill-daily-activity-${rows[rows.length - 1]?.day ?? ''}.csv`,
      ['Date', 'Users logged in', 'New sign-ups', 'Bills', 'Billed value (₹)', 'Shops that billed', 'Average bill (₹)'],
      [...rows]
        .reverse()
        .map((r) => [r.day, r.logins, r.signups, r.bills, paiseToRupees(r.revenue), r.activeShops, paiseToRupees(r.bills ? Math.round(r.revenue / r.bills) : 0)]),
    );
  }

  const toggle = 'rounded-md px-2.5 py-1 font-medium';
  const on = 'bg-ink text-canvas';
  const off = 'text-ink-soft hover:text-ink';

  return (
    <Panel
      title="Daily activity"
      subtitle={`Last ${range} days · ${count(uniqueLoggedIn)} users logged in · ${count(totals.bills)} bills · ${formatPaise(totals.revenue)} billed · ${count(totals.signups)} sign-ups`}
      flush
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex rounded-lg border border-border p-0.5 text-xs" role="group" aria-label="Date range">
            {([7, 30, 90] as const).map((r) => (
              <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} className={`${toggle} ${range === r ? on : off}`}>
                {r}d
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-border p-0.5 text-xs" role="group" aria-label="View">
            {(['chart', 'table'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`${toggle} capitalize ${view === v ? on : off}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {loginsError && (
        <p role="status" className="border-b border-border bg-warning/10 px-5 py-2.5 text-xs text-ink-soft">
          Login numbers aren&rsquo;t available yet ({loginsError}). Publish the latest Firestore rules to enable them.
        </p>
      )}

      {view === 'chart' ? (
        <div className="p-5">
          <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Metric">
            {metrics.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={metric === m.key}
                onClick={() => setMetric(m.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  metric === m.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-ink-soft hover:text-ink'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {metric === 'logins' && (
            <AreaChart
              points={rows.map((r) => ({ label: label(r), value: r.logins, secondary: r.bills }))}
              format={(v) => `${count(v)} users logged in`}
              formatSecondary={count}
              secondaryLabel="bills"
            />
          )}
          {metric === 'bills' && (
            <AreaChart
              points={rows.map((r) => ({ label: label(r), value: r.bills, secondary: r.revenue }))}
              format={(v) => `${count(v)} bills`}
              formatSecondary={formatPaise}
              secondaryLabel="billed"
            />
          )}
          {metric === 'revenue' && (
            <AreaChart
              points={rows.map((r) => ({ label: label(r), value: r.revenue, secondary: r.bills }))}
              format={formatPaise}
              formatSecondary={count}
              secondaryLabel="bills"
            />
          )}
          {metric === 'signups' && <Bars points={rows.map((r) => ({ label: label(r), value: r.signups }))} format={(v) => `${count(v)} sign-ups`} height={200} />}
        </div>
      ) : (
        <div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="sticky top-0 z-10 bg-surface text-xs text-ink-soft shadow-[0_1px_0_var(--wb-line)]">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Logged in</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Sign-ups</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Bills</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Billed value</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Shops billing</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Avg bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {[...rows].reverse().map((r, i) => (
                  <tr key={r.day} className={i === 0 ? 'bg-primary/[0.04]' : 'hover:bg-ink/[0.03]'}>
                    <td className="px-5 py-2.5 text-ink">
                      {r.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {i === 0 && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary">Today</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink">{count(r.logins)}</td>
                    <td className="px-4 py-2.5 text-right text-ink">{count(r.signups)}</td>
                    <td className="px-4 py-2.5 text-right text-ink">{count(r.bills)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink">{formatPaise(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-ink">{count(r.activeShops)}</td>
                    <td className="px-5 py-2.5 text-right text-ink-soft">{formatPaise(r.bills ? Math.round(r.revenue / r.bills) : 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-surface text-xs font-semibold text-ink shadow-[0_-1px_0_var(--wb-line)] tabular-nums">
                <tr>
                  <td className="px-5 py-3">Total ({range} days)</td>
                  <td className="px-4 py-3 text-right" title="Unique users across the range">{count(uniqueLoggedIn)}</td>
                  <td className="px-4 py-3 text-right">{count(totals.signups)}</td>
                  <td className="px-4 py-3 text-right">{count(totals.bills)}</td>
                  <td className="px-4 py-3 text-right">{formatPaise(totals.revenue)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-5 py-3 text-right">{formatPaise(totals.bills ? Math.round(totals.revenue / totals.bills) : 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-3">
            <button type="button" onClick={exportCsv} className="text-xs font-medium text-primary hover:underline">
              Download CSV
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
