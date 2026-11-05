'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '@/lib/DashboardContext';
import EmptyState from '@/components/dashboard/EmptyState';
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
  const { bills } = useDashboard();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState(useSearchParams().get('q') ?? '');

  const filtered = query.trim()
    ? bills.filter((b) => {
        const q = query.trim().toLowerCase();
        return b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q) || formatBillNo(b.billNumber).toLowerCase().includes(q);
      })
    : bills;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">Bills</h1>
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
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, phone or bill number"
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:max-w-sm"
          />

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">Bill</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
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
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatPaise(bill.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && <p className="text-center text-sm text-ink-soft">No bills match &ldquo;{query}&rdquo;.</p>}

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
