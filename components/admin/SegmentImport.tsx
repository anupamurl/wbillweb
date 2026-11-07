'use client';

import { useId, useState, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import Modal from './Modal';
import { formatPaise } from '@/lib/currency';
import { formatRate } from '@/lib/gst';
import { MAX_SEGMENT_ITEMS, mergeCatalog, parseCatalogSheet, type CatalogItem, type ParsedSheet } from '@/lib/catalog';
import { readSpreadsheet, SheetError } from '@/lib/sheet';
import { createSegment, getSegmentCatalog, saveSegmentCatalog, type Segment } from '@/lib/segments';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * New segment (name + optional sheet) or an upload into an existing one.
 * Nothing is written until the admin has seen the preview and pressed Apply.
 */
export default function SegmentImport({
  segment,
  existingNames,
  onClose,
  onDone,
}: {
  /** null = create a new segment. */
  segment: Segment | null;
  existingNames: string[];
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const titleId = useId();
  const fileId = useId();
  const [name, setName] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedSheet | null>(null);
  const [existing, setExisting] = useState<CatalogItem[] | null>(segment ? null : []);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const creating = segment === null;
  const result = parsed && existing ? mergeCatalog(existing, parsed.items, creating ? 'merge' : mode) : null;

  async function pickFile(file: File | undefined) {
    setError('');
    setParsed(null);
    setFileName(file?.name ?? '');
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError('That file is larger than 10 MB. Split it or remove extra sheets and columns.');
      return;
    }
    setReading(true);
    try {
      const [rows, current] = await Promise.all([
        readSpreadsheet(await file.arrayBuffer(), file.name),
        existing ?? (segment ? getSegmentCatalog(segment.id) : Promise.resolve([])),
      ]);
      setExisting(current);
      const p = parseCatalogSheet(rows);
      if (p.items.length === 0) setError(p.rowsRead ? 'No valid products in this sheet. See the problems below.' : 'This sheet has no product rows.');
      setParsed(p);
    } catch (e) {
      setError(e instanceof SheetError ? e.message : 'Could not read that file. Upload an .xlsx or .csv file in the sample format.');
    } finally {
      setReading(false);
    }
  }

  async function apply(event: FormEvent) {
    event.preventDefault();
    setError('');
    const cleanName = name.replace(/\s+/g, ' ').trim();
    if (creating) {
      if (!cleanName) return setError('Enter a segment name.');
      if (existingNames.some((n) => n.toLowerCase() === cleanName.toLowerCase())) return setError('A segment with this name already exists.');
    } else if (!result) return setError('Choose a sheet to upload.');
    if (parsed && parsed.items.length === 0) return setError('This sheet has no valid products to add.');

    setBusy(true);
    try {
      if (creating) {
        await createSegment(cleanName, result?.items ?? []);
        onDone(`Created “${cleanName}”${result ? ` with ${result.items.length.toLocaleString('en-IN')} products` : ''}.`);
      } else if (result) {
        await saveSegmentCatalog(segment.id, result.items);
        onDone(`${segment.name}: ${result.added} added, ${result.updated} updated${result.removed ? `, ${result.removed} removed` : ''}.`);
      }
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === 'permission-denied'
          ? 'Firestore refused this. Publish the latest wbillmobile/firestore.rules (Firestore Database → Rules), wait a minute, then retry.'
          : 'Could not save. Check your connection and try again.',
      );
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={busy} wide labelledBy={titleId}>
      <form onSubmit={apply} className="flex flex-col gap-5 p-6">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {creating ? 'New segment' : `Upload products to ${segment.name}`}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {creating
              ? 'Owners see this as a business type when they set up their shop. You can add the product sheet now or later.'
              : 'Products are matched by name, ignoring upper/lower case. Nothing changes until you press Apply.'}
          </p>
        </div>

        {creating && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-soft">
              Segment name <span className="text-error">*</span>
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Medical store"
              disabled={busy}
              className="h-11 rounded-xl border border-border bg-canvas px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        )}

        <div>
          <label
            htmlFor={fileId}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!busy) void pickFile(e.dataTransfer.files[0]);
            }}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="document" className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">{fileName || 'Choose an Excel or CSV file'}</span>
            <span className="text-xs text-ink-soft">{reading ? 'Reading…' : '.xlsx or .csv · drop it here or click to browse'}</span>
          </label>
          <input
            id={fileId}
            type="file"
            accept=".xlsx,.csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {!creating && parsed && parsed.items.length > 0 && (
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-medium text-ink-soft">How to apply this sheet</legend>
            <ModeOption checked={mode === 'merge'} onChange={() => setMode('merge')} title="Merge (recommended)" body="Add new products and update prices. Products not in the sheet stay." />
            <ModeOption checked={mode === 'replace'} onChange={() => setMode('replace')} title="Replace all" body="The segment becomes exactly this sheet. Products not in it are removed." />
          </fieldset>
        )}

        {result && parsed && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Count label="New" value={result.added} tone="success" />
              <Count label="Updated" value={result.updated} tone="primary" />
              <Count label="Unchanged" value={result.unchanged} />
              {creating || mode === 'merge' ? (
                <Count label="Skipped rows" value={parsed.issues.filter((i) => i.row > 0 && !i.message.startsWith('Same product')).length} tone={parsed.issues.length ? 'warning' : undefined} />
              ) : (
                <Count label="Removed" value={result.removed} tone={result.removed ? 'error' : undefined} />
              )}
            </div>
            <p className="text-xs text-ink-soft">
              After this the segment will have <span className="font-semibold text-ink">{result.items.length.toLocaleString('en-IN')}</span> product
              {result.items.length === 1 ? '' : 's'} (limit {MAX_SEGMENT_ITEMS.toLocaleString('en-IN')}).
            </p>

            {parsed.items.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border">
                <p className="border-b border-border bg-canvas px-3 py-2 text-xs font-medium text-ink-soft">First rows read from the sheet</p>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {parsed.items.slice(0, 5).map((i) => (
                      <tr key={i.name}>
                        <td className="px-3 py-2 text-ink">{i.name}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink-soft">{formatPaise(i.price)}</td>
                        <td className="w-16 px-3 py-2 text-right tabular-nums text-ink-soft">{formatRate(i.gst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {parsed.issues.length > 0 && (
              <details className="rounded-xl border border-warning/40 bg-warning/5 px-3 py-2 text-sm" open={parsed.items.length === 0}>
                <summary className="cursor-pointer font-medium text-ink">
                  {parsed.issues.length} row{parsed.issues.length === 1 ? '' : 's'} need attention
                </summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-ink-soft">
                  {parsed.issues.slice(0, 200).map((i, k) => (
                    <li key={k}>
                      {i.row > 0 && <span className="font-medium text-ink">Row {i.row}: </span>}
                      {i.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || reading || (!creating && !result) || (parsed !== null && parsed.items.length === 0)}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${!creating && mode === 'replace' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {busy ? 'Saving…' : creating ? 'Create segment' : mode === 'replace' ? 'Replace all products' : 'Apply'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModeOption({ checked, onChange, title, body }: { checked: boolean; onChange: () => void; title: string; body: string }) {
  return (
    <label className={`flex cursor-pointer gap-2.5 rounded-xl border p-3 text-sm transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-ink/5'}`}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5 accent-[var(--color-primary)]" />
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-soft">{body}</span>
      </span>
    </label>
  );
}

const tones = {
  success: 'text-success',
  primary: 'text-primary',
  warning: 'text-warning',
  error: 'text-error',
} as const;

function Count({ label, value, tone }: { label: string; value: number; tone?: keyof typeof tones }) {
  return (
    <div className="rounded-xl border border-border bg-canvas px-3 py-2.5">
      <p className="text-[0.7rem] font-medium text-ink-soft">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${tone && value ? tones[tone] : 'text-ink'}`}>{value.toLocaleString('en-IN')}</p>
    </div>
  );
}
