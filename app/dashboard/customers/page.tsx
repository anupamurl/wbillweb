'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/DashboardContext';
import EmptyState from '@/components/dashboard/EmptyState';
import { customersOf } from '@/lib/insights';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';

export default function CustomersPage() {
  const { bills } = useDashboard();
  const [query, setQuery] = useState('');
  const customers = customersOf(bills);
  const filtered = query.trim()
    ? customers.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()) || c.phone.includes(query.trim()))
    : customers;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="wb-display text-2xl text-ink sm:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-ink-soft">Built from the customer on each bill you&rsquo;ve saved.</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No customers yet"
          body="Every bill you save adds its customer here, with their total spend and visit history."
          ctaLabel="Create your first bill"
          ctaHref="/dashboard/bills/new"
        />
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone"
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:max-w-sm"
          />

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-ink-soft">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 text-right font-medium">Bills</th>
                  <th className="px-5 py-3 text-right font-medium">Total spent</th>
                  <th className="px-5 py-3 text-right font-medium">Last visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.key} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{c.name || 'Walk-in customer'}</p>
                      <p className="text-xs text-ink-soft">{formatPhone(c.phone)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink-soft">{c.billCount}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatPaise(c.totalSpent)}</td>
                    <td className="px-5 py-3.5 text-right text-ink-soft">
                      {c.lastBillDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && <p className="text-center text-sm text-ink-soft">No customers match &ldquo;{query}&rdquo;.</p>}
        </>
      )}
    </div>
  );
}
