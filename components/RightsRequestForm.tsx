'use client';

import { useState, type FormEvent } from 'react';
import { brand } from '@/lib/brand';
import { RESPONSE_DAYS } from '@/lib/legal';
import { REQUEST_TYPES, requestError, type RequestType } from '@/lib/rightsRequestForm';

const field = 'mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none';

/** Saves to the database. Firebase is only fetched when someone submits, so the page stays light. */
export default function RightsRequestForm() {
  const [type, setType] = useState<RequestType>('access');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [details, setDetails] = useState('');
  const [shopName, setShopName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const draft = { type, name, contact, details, shopName };
    const problem = requestError(draft);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      const { submitRightsRequest } = await import('@/lib/rightsRequests');
      await submitRightsRequest(draft);
      setSent(true);
    } catch {
      setError(`We couldn’t send your request. Try again, or email ${brand.email}.`);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <p role="status" className="mt-4 rounded-xl border border-border bg-canvas p-4 text-sm text-ink">
        We&rsquo;ve received your request and will reply within {RESPONSE_DAYS} days.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-sm font-medium text-ink">
      <label>
        What do you need?
        <select value={type} onChange={(e) => setType(e.target.value as RequestType)} className={field}>
          {REQUEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label>
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={field} />
      </label>
      <label>
        Mobile number or email
        <input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={254} className={field} />
      </label>
      {type === 'shop_bill' && (
        <label>
          Shop name
          <input value={shopName} onChange={(e) => setShopName(e.target.value)} maxLength={80} className={field} />
        </label>
      )}
      <label>
        Details
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={4} className={field} />
      </label>
      <p className="text-xs font-normal text-ink-soft">
        We save this in our database only to handle your request, and erase it one year after we finish.
      </p>
      {error && <p role="alert" className="font-normal text-error">{error}</p>}
      <button type="submit" disabled={busy} className="wb-btn wb-btn-md wb-btn-primary self-start disabled:opacity-60">
        {busy ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}
