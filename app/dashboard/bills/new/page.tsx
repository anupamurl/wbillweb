'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { useDashboard } from '@/lib/DashboardContext';
import { saveBill } from '@/lib/data';
import { formatPaise, parseRupeesToPaise } from '@/lib/currency';
import { cleanNumber, isIndianMobile } from '@/lib/phone';

type Row = { name: string; qty: string; price: string };

const emptyRow: Row = { name: '', qty: '1', price: '' };

export default function NewBillPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const parsedItems = rows.map((r) => ({
    name: r.name.trim(),
    qty: Number.parseInt(r.qty, 10),
    unitPrice: parseRupeesToPaise(r.price || '0'),
  }));
  const grandTotal = parsedItems.reduce((sum, i) => sum + (i.unitPrice ?? 0) * (Number.isFinite(i.qty) ? i.qty : 0), 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const phoneDigits = cleanNumber(customerPhone);
    if (!isIndianMobile(phoneDigits)) {
      setError('Enter a valid 10-digit customer mobile number.');
      return;
    }
    const items = parsedItems;
    if (items.length === 0 || items.some((i) => !i.name || !Number.isInteger(i.qty) || i.qty < 1 || i.unitPrice === null || i.unitPrice < 0)) {
      setError('Check the items: each needs a name, a quantity of at least 1, and a valid price.');
      return;
    }
    if (items.length > 200) {
      setError('A bill can have at most 200 items.');
      return;
    }

    setSaving(true);
    try {
      const bill = await saveBill(user.uid, {
        customerName: customerName.trim(),
        customerPhone: phoneDigits,
        items: items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice as number })),
      });
      router.push(`/dashboard/bills/view?id=${bill.id}`);
    } catch {
      setError('Could not save the bill. Check your connection and try again.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/bills" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        Back to bills
      </Link>

      <h1 className="wb-display mt-3 text-2xl text-ink sm:text-3xl">New bill</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name (optional)">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in customer"
              maxLength={80}
              className={inputClass}
            />
          </Field>
          <Field label="Customer mobile number" required>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="98765 43210"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Items</p>
            <button type="button" onClick={addRow} className="text-sm font-medium text-primary hover:underline">
              + Add item
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {rows.map((row, index) => {
              const lineTotal = (parsedItems[index].unitPrice ?? 0) * (Number.isFinite(parsedItems[index].qty) ? parsedItems[index].qty : 0);
              return (
                <div key={index} className="grid grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_auto]">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(index, { name: e.target.value })}
                    placeholder="Item name"
                    className={inputClass}
                  />
                  <input
                    value={row.qty}
                    onChange={(e) => updateRow(index, { qty: e.target.value.replace(/\D/g, '') })}
                    placeholder="Qty"
                    inputMode="numeric"
                    className={`${inputClass} text-center`}
                  />
                  <input
                    value={row.price}
                    onChange={(e) => updateRow(index, { price: e.target.value })}
                    placeholder="Price"
                    inputMode="decimal"
                    className={`${inputClass} text-right`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length === 1}
                    aria-label="Remove item"
                    className="flex h-12 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-error/10 hover:text-error disabled:opacity-30"
                  >
                    <Icon name="cross" className="h-4 w-4" />
                  </button>
                  {row.name && row.qty && row.price && (
                    <p className="col-span-4 -mt-1 text-right text-xs text-ink-soft">= {formatPaise(lineTotal)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <span className="text-base font-semibold text-ink">Total</span>
          <span className="text-xl font-semibold tabular-nums text-ink">{formatPaise(grandTotal)}</span>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="wb-btn wb-btn-lg bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save bill'}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {children}
    </label>
  );
}
