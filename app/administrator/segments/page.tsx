'use client';

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import { useAdmin } from '@/components/admin/AdminGate';
import Modal from '@/components/admin/Modal';
import SegmentImport from '@/components/admin/SegmentImport';
import { Empty, PageHeader, Panel, SearchInput, ToolbarButton, relativeTime } from '@/components/admin/ui';
import { formatPaise } from '@/lib/currency';
import { GST_RATES, formatRate } from '@/lib/gst';
import { SAMPLE_ROWS, itemKey, type CatalogItem } from '@/lib/catalog';
import { downloadCatalog, downloadSampleSheet } from '@/lib/download';
import { deleteSegment, getSegmentCatalog, renameSegment, watchSegments, type Segment } from '@/lib/segments';

type DialogState =
  | { kind: 'create' }
  | { kind: 'import'; segment: Segment }
  | { kind: 'rename'; segment: Segment }
  | { kind: 'delete'; segment: Segment };

export default function AdminSegmentsPage() {
  const { shops } = useAdmin();
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [q, setQ] = useState('');

  useEffect(
    () =>
      watchSegments(
        (s) => {
          setSegments(s);
          setLoadError('');
        },
        (e: Error & { code?: string }) =>
          setLoadError(
            e.code === 'permission-denied'
              ? 'Firestore refused to list segments. Publish the latest wbillmobile/firestore.rules in the Firebase console, then reload.'
              : 'Could not load segments.',
          ),
      ),
    [],
  );

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shops) for (const id of s.segments) m.set(id, (m.get(id) ?? 0) + 1);
    return m;
  }, [shops]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (segments ?? []).filter((s) => !needle || s.name.toLowerCase().includes(needle));
  }, [segments, q]);

  const totalProducts = (segments ?? []).reduce((n, s) => n + s.itemCount, 0);

  function done(message: string) {
    setDialog(null);
    setNotice(message);
    setTimeout(() => setNotice((n) => (n === message ? '' : n)), 6000);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Segments"
        subtitle="Business types owners pick when they set up their shop. Each has a product list that fills in bills as they type."
        actions={
          <button
            type="button"
            onClick={() => setDialog({ kind: 'create' })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <span aria-hidden="true" className="text-base leading-none">+</span>
            New segment
          </button>
        }
      />

      <SampleFormat />

      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          <Icon name="check" className="h-4 w-4" />
          {notice}
        </p>
      )}

      <Panel
        title={segments ? `${segments.length} segment${segments.length === 1 ? '' : 's'} · ${totalProducts.toLocaleString('en-IN')} products` : 'Segments'}
        subtitle="Upload a sheet to add or update products. Shops see changes the next time they open a new bill."
        action={segments && segments.length > 5 ? <SearchInput value={q} onChange={setQ} placeholder="Search segments" /> : undefined}
        flush
      >
        {loadError ? (
          <p role="alert" className="p-5 text-sm text-error">
            {loadError}
          </p>
        ) : segments === null ? (
          <p className="p-5 text-sm text-ink-soft">Loading…</p>
        ) : segments.length === 0 ? (
          <Empty title="No segments yet" body="Create one, such as “Medical store” or “Grocery”, and upload its product sheet." />
        ) : list.length === 0 ? (
          <Empty title="No segment matches that search" />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((s) => (
              <li key={s.id}>
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => (o === s.id ? null : s.id))}
                    aria-expanded={open === s.id}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon name="store" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{s.name}</span>
                      <span className="block text-xs text-ink-soft">
                        {s.itemCount.toLocaleString('en-IN')} product{s.itemCount === 1 ? '' : 's'} · used by {usage.get(s.id) ?? 0} shop
                        {(usage.get(s.id) ?? 0) === 1 ? '' : 's'} · updated {relativeTime(s.updatedAt)}
                      </span>
                    </span>
                    <Icon name="chevron" className={`ml-auto h-4 w-4 shrink-0 text-ink-faint transition-transform ${open === s.id ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: 'import', segment: s })}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-ink hover:bg-ink/5"
                    >
                      <Icon name="download" className="h-3.5 w-3.5 rotate-180" />
                      Upload sheet
                    </button>
                    <IconButton label={`Rename ${s.name}`} onClick={() => setDialog({ kind: 'rename', segment: s })}>
                      <Icon name="brush" className="h-4 w-4" />
                    </IconButton>
                    <IconButton label={`Delete ${s.name}`} danger onClick={() => setDialog({ kind: 'delete', segment: s })}>
                      <Icon name="cross" className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
                {open === s.id && <SegmentItems segment={s} />}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {dialog?.kind === 'create' && (
        <SegmentImport segment={null} existingNames={(segments ?? []).map((s) => s.name)} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.kind === 'import' && (
        <SegmentImport segment={dialog.segment} existingNames={[]} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.kind === 'rename' && (
        <RenameDialog
          segment={dialog.segment}
          taken={(segments ?? []).filter((s) => s.id !== dialog.segment.id).map((s) => s.name)}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteDialog segment={dialog.segment} shopsUsing={usage.get(dialog.segment.id) ?? 0} onClose={() => setDialog(null)} onDone={done} />
      )}
    </div>
  );
}

function SampleFormat() {
  const [header, ...rows] = SAMPLE_ROWS;
  return (
    <Panel
      title="Sheet format"
      subtitle="One product per row, with three columns. Upload .xlsx or .csv."
      action={<ToolbarButton onClick={downloadSampleSheet} icon="download">Download sample</ToolbarButton>}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas text-left">
                <th className="w-10 px-3 py-2 text-center text-xs font-medium text-ink-faint" />
                {header.map((h, i) => (
                  <th key={i} className={`px-3 py-2 text-xs font-semibold text-ink ${i > 0 ? 'text-right' : ''}`}>
                    <span className="mr-1.5 font-normal text-ink-faint">{String.fromCharCode(65 + i)}</span>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, k) => (
                <tr key={k}>
                  <td className="px-3 py-2 text-center text-xs text-ink-faint">{k + 2}</td>
                  <td className="px-3 py-2 text-ink">{r[0]}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-soft">{Number(r[1]).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-soft">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-2 text-xs leading-relaxed text-ink-soft">
          <li>
            <span className="font-medium text-ink">Product name</span>: up to 100 characters. The same name again (ignoring case) updates that product.
          </li>
          <li>
            <span className="font-medium text-ink">Price</span>: in rupees, up to 2 decimals. ₹, “Rs” and commas are fine.
          </li>
          <li>
            <span className="font-medium text-ink">GST %</span>: one of {GST_RATES.map(formatRate).join(', ')}. Blank means 0%.
          </li>
          <li>Columns can be in any order if the header row names them. Extra columns are ignored.</li>
        </ul>
      </div>
    </Panel>
  );
}

const SHOW = 100;

function SegmentItems({ segment }: { segment: Segment }) {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(SHOW);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    getSegmentCatalog(segment.id)
      .then((i) => !cancelled && setItems([...i].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => !cancelled && setError('Could not load the products.'));
    return () => {
      cancelled = true;
    };
  }, [segment.id, segment.updatedAt]);

  const filtered = useMemo(() => {
    const needle = itemKey(q);
    return (items ?? []).filter((i) => !needle || itemKey(i.name).includes(needle));
  }, [items, q]);

  return (
    <div className="border-t border-border bg-canvas px-5 py-4">
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : items === null ? (
        <p className="text-sm text-ink-soft">Loading products…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-soft">No products yet. Use “Upload sheet” to add them.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SearchInput
              value={q}
              onChange={(v) => {
                setQ(v);
                setLimit(SHOW);
              }}
              placeholder={`Search ${items.length.toLocaleString('en-IN')} products`}
            />
            <ToolbarButton onClick={() => downloadCatalog(`${segment.name.replace(/[^\w -]+/g, '').trim() || 'segment'}-products.xlsx`, items)} icon="download">
              Download as Excel
            </ToolbarButton>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-ink-soft">
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="w-20 px-3 py-2 text-right font-medium">GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.slice(0, limit).map((i) => (
                  <tr key={i.name}>
                    <td className="px-3 py-2 text-ink">{i.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-soft">{formatPaise(i.price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-soft">{formatRate(i.gst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="px-3 py-4 text-center text-sm text-ink-soft">No product matches.</p>}
          </div>
          {filtered.length > limit && (
            <button type="button" onClick={() => setLimit((l) => l + SHOW * 5)} className="mt-3 text-sm font-medium text-primary hover:underline">
              Show more ({(filtered.length - limit).toLocaleString('en-IN')} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}

function IconButton({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition-colors ${danger ? 'hover:bg-error/10 hover:text-error' : 'hover:bg-ink/5 hover:text-ink'}`}
    >
      {children}
    </button>
  );
}

function saveError(e: unknown): string {
  return (e as { code?: string })?.code === 'permission-denied'
    ? 'Firestore refused this. Publish the latest firestore.rules and try again.'
    : 'Could not save. Check your connection and try again.';
}

function RenameDialog({ segment, taken, onClose, onDone }: { segment: Segment; taken: string[]; onClose: () => void; onDone: (m: string) => void }) {
  const id = useId();
  const [name, setName] = useState(segment.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const clean = name.replace(/\s+/g, ' ').trim();
    if (!clean) return setError('Enter a name.');
    if (taken.some((t) => t.toLowerCase() === clean.toLowerCase())) return setError('Another segment already has this name.');
    setBusy(true);
    try {
      await renameSegment(segment.id, clean);
      onDone(`Renamed to “${clean}”.`);
    } catch (err) {
      setError(saveError(err));
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={busy} labelledBy={id}>
      <form onSubmit={submit} className="p-6">
        <h2 id={id} className="text-lg font-semibold">
          Rename segment
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Shops that picked it keep it; they just see the new name.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          disabled={busy}
          aria-label="Segment name"
          className="mt-4 h-11 w-full rounded-xl border border-border bg-canvas px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ segment, shopsUsing, onClose, onDone }: { segment: Segment; shopsUsing: number; onClose: () => void; onDone: (m: string) => void }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    try {
      await deleteSegment(segment.id);
      onDone(`Deleted “${segment.name}”.`);
    } catch (err) {
      setError(saveError(err));
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={busy} labelledBy={id}>
      <div className="p-6">
        <h2 id={id} className="text-lg font-semibold">
          Delete {segment.name}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Its {segment.itemCount.toLocaleString('en-IN')} products stop being suggested
          {shopsUsing ? ` to the ${shopsUsing} shop${shopsUsing === 1 ? '' : 's'} that picked it` : ''}. Bills already made don&rsquo;t change, and items
          shops have saved themselves stay. This can&rsquo;t be undone; download the products first if you may need them.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={confirm} className="h-10 rounded-xl bg-error px-4 text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-50">
            {busy ? 'Deleting…' : 'Delete segment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
