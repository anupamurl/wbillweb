'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import { useDashboard } from '@/lib/DashboardContext';
import { formatPaise, parseRupeesToPaise } from '@/lib/currency';
import { GST_RATES, formatRate } from '@/lib/gst';
import { MAX_ITEM_NAME, MAX_PRICE, cleanName, itemKey } from '@/lib/catalog';
import { deleteShopItem, saveShopItems, useSegments, watchShopItems, type ShopItem } from '@/lib/segments';

/**
 * The shop's own products: remembered automatically from bills (new items
 * and changed prices), and editable here. They're suggested before the
 * catalogue products of the shop's business types.
 */
export default function ItemsPage() {
  const { shop, shopId, isOwner } = useDashboard();
  const segments = useSegments(isOwner);
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!shopId || !isOwner) return;
    return watchShopItems(shopId, setItems, () => setLoadError('Could not load your items. Check your connection and reload.'));
  }, [shopId, isOwner]);

  const filtered = useMemo(() => {
    const needle = itemKey(q);
    return (items ?? []).filter((i) => !needle || itemKey(i.name).includes(needle));
  }, [items, q]);

  if (!isOwner) {
    return <p className="py-16 text-center text-sm text-ink-soft">Only the shop owner can manage items.</p>;
  }

  const picked = (segments ?? []).filter((s) => shop?.segments.includes(s.id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="wb-display text-2xl text-ink sm:text-3xl">My items</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            New items and changed prices on your bills are saved here automatically, and suggested first next time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setEditing(null);
          }}
          className="wb-btn wb-btn-md bg-primary text-white shadow-sm hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
        >
          + Add item
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-4 text-sm">
        <Icon name="store" className="h-4 w-4 text-primary" />
        {picked.length ? (
          <span className="text-ink-soft">
            Also suggesting products from <span className="font-medium text-ink">{picked.map((s) => s.name).join(', ')}</span>.
          </span>
        ) : (
          <span className="text-ink-soft">Pick what you sell to get ready-made product suggestions.</span>
        )}
        <Link href="/dashboard/profile" className="ml-auto font-medium text-primary hover:underline">
          {picked.length ? 'Change' : 'Choose business type'}
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-ink">{items ? `${items.length.toLocaleString('en-IN')} item${items.length === 1 ? '' : 's'}` : 'Items'}</p>
          {items && items.length > 0 && (
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search items"
              aria-label="Search items"
              className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          )}
        </div>

        {adding && shopId && (
          <div className="border-b border-border bg-canvas px-5 py-4">
            <ItemForm shopId={shopId} existing={items ?? []} onDone={() => setAdding(false)} />
          </div>
        )}

        {loadError ? (
          <p className="p-5 text-sm text-error">{loadError}</p>
        ) : items === null ? (
          <p className="p-5 text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-ink">No items yet</p>
            <p className="mt-1 text-sm text-ink-soft">Make a bill, or add items here, and they&rsquo;ll show up as suggestions.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((item) =>
              editing === item.id && shopId ? (
                <li key={item.id} className="bg-canvas px-5 py-4">
                  <ItemForm shopId={shopId} item={item} existing={items} onDone={() => setEditing(null)} />
                </li>
              ) : (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink-soft">GST {formatRate(item.gst)}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-ink">{formatPaise(item.price)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item.id);
                      setAdding(false);
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    Edit
                  </button>
                </li>
              ),
            )}
            {filtered.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-soft">No item matches.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}

function ItemForm({ shopId, item, existing, onDone }: { shopId: string; item?: ShopItem; existing: ShopItem[]; onDone: () => void }) {
  const [name, setName] = useState(item?.name ?? '');
  const [price, setPrice] = useState(item ? (item.price / 100).toFixed(2) : '');
  const [gst, setGst] = useState(item?.gst ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const clean = cleanName(name);
    const paise = parseRupeesToPaise(price);
    if (!clean) return setError('Enter the item name.');
    if (clean.length > MAX_ITEM_NAME) return setError(`Keep the name under ${MAX_ITEM_NAME} characters.`);
    if (paise === null || paise > MAX_PRICE) return setError('Enter a valid price, like 49 or 49.50.');
    const clash = existing.find((i) => itemKey(i.name) === itemKey(clean) && i.id !== item?.id);
    if (clash) return setError(`“${clash.name}” is already in your items. Edit that one instead.`);
    setBusy(true);
    try {
      // The doc id comes from the name, so a rename is a new doc + delete.
      await saveShopItems(shopId, [{ name: clean, price: paise, gst }]);
      if (item && itemKey(item.name) !== itemKey(clean)) await deleteShopItem(shopId, item.id);
      onDone();
    } catch {
      setError('Could not save. Check your connection and try again.');
      setBusy(false);
    }
  }

  async function remove() {
    if (!item) return;
    setBusy(true);
    try {
      await deleteShopItem(shopId, item.id);
      onDone();
    } catch {
      setError('Could not delete. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem_6.5rem]">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_ITEM_NAME} placeholder="Item name" aria-label="Item name" className={inputClass} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="Price ₹" aria-label="Price in rupees" className={`${inputClass} text-right`} />
        <select value={gst} onChange={(e) => setGst(Number(e.target.value))} aria-label="GST rate" className={inputClass}>
          {GST_RATES.map((r) => (
            <option key={r} value={r}>
              GST {formatRate(r)}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy} className="wb-btn wb-btn-sm bg-primary text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" disabled={busy} onClick={onDone} className="wb-btn wb-btn-sm border border-border bg-surface text-ink">
          Cancel
        </button>
        {item && (
          <button type="button" disabled={busy} onClick={remove} className="ml-auto text-sm font-medium text-error hover:underline disabled:opacity-60">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';
