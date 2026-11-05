'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '@/lib/DashboardContext';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { formatBillNo } from '@/lib/models';
import Icon from '@/components/Icon';

/**
 * A query-string "detail" route (?id=...) rather than /bills/[id] — this
 * site is a static export with no server, and bill ids only exist once a
 * user creates one, so there is nothing to pre-render a dynamic segment for.
 */
function BillViewInner() {
  const { bills, loading } = useDashboard();
  const id = useSearchParams().get('id');
  const bill = bills.find((b) => b.id === id);

  if (!bill) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-ink-soft">{loading ? 'Loading…' : "That bill wasn't found."}</p>
        <Link href="/dashboard/bills" className="text-sm text-primary hover:underline">
          Back to bills
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard/bills" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        Back to bills
      </Link>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="wb-display text-2xl text-ink">{formatBillNo(bill.billNumber)}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {bill.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Saved</span>
        </div>

        <div className="mt-6 grid gap-1 border-t border-border pt-5 text-sm">
          <p className="text-ink">
            <span className="text-ink-soft">Customer: </span>
            {bill.customerName || '—'}
          </p>
          <p className="text-ink">
            <span className="text-ink-soft">Phone: </span>
            {formatPhone(bill.customerPhone)}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-left text-xs text-ink-soft">
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                <th className="px-4 py-2.5 text-right font-medium">Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2.5 text-ink">{item.name}</td>
                  <td className="px-4 py-2.5 text-right text-ink-soft tabular-nums">{item.qty}</td>
                  <td className="px-4 py-2.5 text-right text-ink-soft tabular-nums">{formatPaise(item.unitPrice)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-ink tabular-nums">{formatPaise(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
          <span className="text-base font-semibold text-ink">Total</span>
          <span className="text-xl font-semibold tabular-nums text-ink">{formatPaise(bill.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BillViewPage() {
  return (
    <Suspense fallback={null}>
      <BillViewInner />
    </Suspense>
  );
}
