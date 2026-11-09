'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import ItemCombobox from '@/components/dashboard/ItemCombobox';
import { useDashboard } from '@/lib/DashboardContext';
import { saveBill } from '@/lib/data';
import { formatPaise, parseRupeesToPaise } from '@/lib/currency';
import { cleanNumber, isIndianMobile } from '@/lib/phone';
import { GST_RATES, computeBill, formatRate, gstSummary } from '@/lib/gst';
import { cleanName, itemKey, itemsToRemember, type Suggestion } from '@/lib/catalog';
import { saveShopItems, useItemSuggestions } from '@/lib/segments';

type Row = { name: string; qty: string; price: string; gst: number };

const emptyRow: Row = { name: '', qty: '1', price: '', gst: 0 };

const paiseToInput = (p: number) => (p % 100 === 0 ? String(p / 100) : (p / 100).toFixed(2));

export default function NewBillPage() {
  const router = useRouter();
  const { user, shop, shopId, isOwner, creatorName } = useDashboard();
  const gstMode = shop?.gstMode ?? 'inclusive';
  const showGst = gstMode !== 'none';
  const { suggestions } = useItemSuggestions(shopId, shop?.segments ?? []);
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
    // Focus the new line's name once it renders.
    setTimeout(() => document.getElementById(`item-${rows.length}`)?.querySelector('input')?.focus(), 0);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  /** A suggestion fills name, price and GST, then moves on to the quantity. */
  function pick(index: number, s: Suggestion) {
    updateRow(index, { name: s.name, price: paiseToInput(s.price), gst: s.gst });
    setTimeout(() => {
      const qty = document.getElementById(`qty-${index}`) as HTMLInputElement | null;
      qty?.focus();
      qty?.select();
    }, 0);
  }

  /** Typed a known name in full without picking it: fill an empty price/GST. */
  function fillIfKnown(index: number) {
    const row = rows[index];
    if (row.price.trim()) return;
    const known = suggestions.find((s) => itemKey(s.name) === itemKey(row.name));
    if (known) updateRow(index, { name: known.name, price: paiseToInput(known.price), gst: known.gst });
  }

  const parsedItems = rows.map((r) => ({
    name: cleanName(r.name),
    qty: Number.parseInt(r.qty, 10),
    unitPrice: parseRupeesToPaise(r.price || '0'),
    gstRate: showGst ? r.gst : 0,
  }));
  const preview = computeBill(
    parsedItems.map((i) => ({ ...i, qty: Number.isFinite(i.qty) ? i.qty : 0, unitPrice: i.unitPrice ?? 0 })),
    gstMode,
  );
  const gstRows = gstSummary({ ...preview, gstMode });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const phoneDigits = cleanNumber(customerPhone);
    if (phoneDigits && !isIndianMobile(phoneDigits)) {
      setError('Enter a valid 10-digit customer mobile number, or leave it blank.');
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
      const lines = items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice as number, gstRate: i.gstRate }));
      const bill = await saveBill(
        shopId ?? user.uid,
        { customerName: customerName.trim(), customerPhone: phoneDigits, items: lines, gstMode },
        { uid: user.uid, name: creatorName },
      );
      // Remember new items and changed prices for next time. Best effort:
      // the bill is already saved, so a failure here must not block anything.
      const remember = itemsToRemember(
        lines.map((l) => ({ name: l.name, price: l.unitPrice, gst: l.gstRate })),
        suggestions,
      );
      if (remember.length && shopId) void saveShopItems(shopId, remember).catch(() => {});
      router.push(`/dashboard/bills/view?id=${bill.id}`);
    } catch {
      setError('Could not save the bill. Check your connection and try again.');
      setSaving(false);
    }
  }

  const rowGrid = showGst
    ? 'grid-cols-[3.75rem_minmax(0,1fr)_5.5rem_2.5rem] sm:grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_5.5rem_2.5rem]'
    : 'grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] sm:grid-cols-[minmax(0,1fr)_5rem_7rem_2.5rem]';

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/bills" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
        Back to bills
      </Link>

      <h1 className="wb-display mt-3 text-2xl text-ink sm:text-3xl">New bill</h1>

      {shop && shop.segments.length === 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-ink-soft">
          <Icon name="sparkle" className="h-4 w-4 text-primary" />
          {isOwner ? (
            <>
              Get product suggestions with price and GST.
              <Link href="/dashboard/profile" className="font-medium text-primary hover:underline">
                Choose what you sell
              </Link>
            </>
          ) : (
            'Items you bill are remembered and suggested next time.'
          )}
        </p>
      )}

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
          <Field label="Customer mobile number (optional)">
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

        <p className="-mt-3 text-xs text-ink-soft">
          Add a customer&rsquo;s details only if they want the bill sent to them. Tell them it will be saved with this bill.
        </p>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Items</p>
            <p className="text-xs text-ink-soft">
              {gstMode === 'inclusive' ? 'Prices include GST' : gstMode === 'exclusive' ? 'GST is added to prices' : ''}
            </p>
          </div>

          <div className={`mt-3 hidden gap-2 px-1 text-[0.7rem] font-medium text-ink-faint sm:grid ${rowGrid}`}>
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price ₹</span>
            {showGst && <span>GST</span>}
            <span />
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:gap-2.5">
            {rows.map((row, index) => {
              const line = preview.items[index];
              return (
                <div key={index} className={`grid gap-2 ${rowGrid}`}>
                  <div id={`item-${index}`} className={showGst ? 'col-span-4 sm:col-span-1' : 'col-span-3 sm:col-span-1'}>
                    <ItemCombobox
                      value={row.name}
                      onChange={(name) => updateRow(index, { name })}
                      onPick={(s) => pick(index, s)}
                      suggestions={suggestions}
                      className={inputClass}
                      placeholder={suggestions.length ? 'Type to search items' : 'Item name'}
                    />
                  </div>
                  <input
                    id={`qty-${index}`}
                    value={row.qty}
                    onFocus={() => fillIfKnown(index)}
                    onChange={(e) => updateRow(index, { qty: e.target.value.replace(/\D/g, '') })}
                    placeholder="Qty"
                    aria-label="Quantity"
                    inputMode="numeric"
                    className={`${inputClass} text-center`}
                  />
                  <input
                    value={row.price}
                    onChange={(e) => updateRow(index, { price: e.target.value })}
                    placeholder="Price"
                    aria-label="Price in rupees"
                    inputMode="decimal"
                    className={`${inputClass} text-right`}
                  />
                  {showGst && (
                    <select
                      value={row.gst}
                      onChange={(e) => updateRow(index, { gst: Number(e.target.value) })}
                      aria-label="GST rate"
                      className={`${inputClass} px-2`}
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {formatRate(r)}
                        </option>
                      ))}
                    </select>
                  )}
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
                    <p className={`${showGst ? 'col-span-4 sm:col-span-5' : 'col-span-3 sm:col-span-4'} -mt-1 text-right text-xs text-ink-soft`}>
                      = {formatPaise(line.lineTotal)}
                      {line.gstAmount > 0 &&
                        ` · ${gstMode === 'inclusive' ? 'incl.' : '+'} ${formatRate(line.gstRate)} GST ${formatPaise(line.gstAmount)}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button type="button" onClick={addRow} className="mt-3 text-sm font-medium text-primary hover:underline">
            + Add item
          </button>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-5 text-sm">
          {gstMode === 'exclusive' && preview.gstTotal > 0 && (
            <Line label="Subtotal" value={formatPaise(preview.subtotal)} />
          )}
          {gstRows.map((r) => (
            <Line
              key={r.rate}
              label={`GST ${formatRate(r.rate)} (CGST ${formatRate(r.rate / 2)} + SGST ${formatRate(r.rate / 2)})`}
              value={gstMode === 'inclusive' ? `incl. ${formatPaise(r.gst)}` : formatPaise(r.gst)}
            />
          ))}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="text-xl font-semibold tabular-nums text-ink">{formatPaise(preview.grandTotal)}</span>
          </div>
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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-ink-soft">
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
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
