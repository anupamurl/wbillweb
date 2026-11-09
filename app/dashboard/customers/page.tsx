'use client';

import Link from 'next/link';
import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import { useDashboard } from '@/lib/DashboardContext';
import { updateCustomerDetails } from '@/lib/privacyData';
import { cleanNumber, isIndianMobile } from '@/lib/phone';
import type { Bill } from '@/lib/models';
import EmptyState from '@/components/dashboard/EmptyState';
import { customerKey, customersOf, type CustomerSummary } from '@/lib/insights';
import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';

export default function CustomersPage() {
  const { bills, shopId } = useDashboard();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<CustomerSummary | null>(null);
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
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.key} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/bills/?q=${encodeURIComponent(c.phone || c.name)}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {c.name || 'Walk-in customer'}
                      </Link>
                      <p className="text-xs text-ink-soft">{formatPhone(c.phone)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink-soft">{c.billCount}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatPaise(c.totalSpent)}</td>
                    <td className="px-5 py-3.5 text-right text-ink-soft">
                      {c.lastBillDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {(c.name || c.phone) && (
                        <button type="button" onClick={() => setEditing(c)} className="whitespace-nowrap text-xs font-medium text-primary hover:underline">
                          Correct or remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && <p className="text-center text-sm text-ink-soft">No customers match &ldquo;{query}&rdquo;.</p>}
        </>
      )}

      {editing && shopId && (
        <CustomerDialog
          shopId={shopId}
          customer={editing}
          bills={bills.filter((b) => customerKey(b) === editing.key)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

/** A customer's right to correction and erasure. Only the name and mobile change. */
function CustomerDialog({ shopId, customer, bills, onClose }: { shopId: string; customer: CustomerSummary; bills: Bill[]; onClose: () => void }) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function apply(details: { name: string; phone: string }, action: 'corrected' | 'removed') {
    setBusy(true);
    setError('');
    try {
      await updateCustomerDetails(shopId, bills, details, action);
      onClose();
    } catch {
      setError('Could not update every bill. Check your connection and try again.');
      setBusy(false);
    }
  }

  function save() {
    const digits = cleanNumber(phone);
    if (digits && !isIndianMobile(digits)) return setError('Enter a valid 10-digit mobile number, or leave it blank.');
    void apply({ name: name.trim().slice(0, 80), phone: digits }, 'corrected');
  }

  const input = 'mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none';
  return (
    <Modal onClose={onClose} busy={busy} labelledBy="customer-edit-title">
      <div className="p-6">
        <h2 id="customer-edit-title" className="text-base font-semibold text-ink">Correct or remove customer details</h2>
        <p className="mt-2 text-sm text-ink-soft">
          This changes {bills.length} bill{bills.length === 1 ? '' : 's'}. Items, amounts and dates stay the same.
        </p>
        <label className="mt-4 block text-sm font-medium text-ink">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} disabled={busy} className={input} />
        </label>
        <label className="mt-3 block text-sm font-medium text-ink">
          Mobile number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={10} disabled={busy} className={input} />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <button type="button" disabled={busy} onClick={() => void apply({ name: '', phone: '' }, 'removed')} className="wb-btn wb-btn-md border border-error/40 bg-surface text-error hover:bg-error/10 disabled:opacity-60">
            Remove details
          </button>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={onClose} className="wb-btn wb-btn-md text-ink-soft hover:text-ink">Cancel</button>
            <button type="button" disabled={busy} onClick={save} className="wb-btn wb-btn-md wb-btn-primary disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
