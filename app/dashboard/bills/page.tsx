'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '@/lib/DashboardContext';
import EmptyState from '@/components/dashboard/EmptyState';
import BillActions from '@/components/dashboard/BillActions';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { formatBillNo } from '@/lib/models';

const PAGE_SIZE = 20;

/** `?q=` pre-fills the search, so a customer row can open that customer's bills. */
export default function BillsPage() {
  return (
    <Suspense fallback={null}>
      <BillsList />
    </Suspense>
  );
}

function BillsList() {
  const { bills, isOwner, employees } = useDashboard();
  const params = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState(params.get('q') ?? '');
  // Owners: `?by=<uid>` (from the Employees page) or the picker narrows to one person.
  const [by, setBy] = useState(params.get('by') ?? '');
  const showBy = isOwner && (employees.length > 0 || bills.some((b) => b.createdByName && b.createdByName !== 'Owner'));

  const filtered = bills.filter((b) => {
    if (by && (by === 'owner' ? b.createdBy && b.createdByName !== 'Owner' : b.createdBy !== by)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      formatBillNo(b.billNumber).toLowerCase().includes(q) ||
      b.createdByName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">{isOwner ? 'Bills' : 'My bills'}</h1>
        <Link
          href="/dashboard/bills/new"
          className="wb-btn wb-btn-md bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
        >
          + New bill
        </Link>
      </div>

      {bills.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No bills yet"
          body="Create your first bill to see it listed here."
          ctaLabel="Create your first bill"
          ctaHref="/dashboard/bills/new"
        />
      ) : (
        <>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer name, phone or bill number"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:max-w-sm"
            />
            {showBy && (
              <select
                value={by}
                onChange={(e) => setBy(e.target.value)}
                aria-label="Made by"
                className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                <option value="">Everyone</option>
                <option value="owner">You (owner)</option>
                {employees
                  .filter((e) => e.uid)
                  .map((e) => (
                    <option key={e.id} value={e.uid}>
                      {e.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">Bill</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  {showBy && <th className="px-5 py-3 font-medium">Made by</th>}
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-3 py-3 text-right font-medium">
                    <span className="sr-only sm:not-sr-only">Share</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.slice(0, visible).map((bill) => (
                  <tr key={bill.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/bills/view?id=${bill.id}`} className="font-medium text-primary hover:underline">
                        {formatBillNo(bill.billNumber)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink">{bill.customerName || formatPhone(bill.customerPhone) || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {bill.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    {showBy && <td className="px-5 py-3.5 text-ink-soft">{madeBy(bill.createdByName)}</td>}
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatPaise(bill.grandTotal)}</td>
                    <td className="px-3 py-2">
                      <BillActions bill={bill} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-ink-soft">{query ? <>No bills match &ldquo;{query}&rdquo;.</> : 'No bills here yet.'}</p>
          )}

          {visible < filtered.length && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="wb-btn wb-btn-md self-center border border-border bg-surface text-ink hover:border-ink/25"
            >
              Show more
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Bills from before employees existed have no name: they're the owner's. */
function madeBy(name: string): string {
  return !name || name === 'Owner' ? 'You' : name;
}
