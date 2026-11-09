'use client';

import { useEffect, useState } from 'react';
import { Empty, fmtDate, PageHeader, Panel } from '@/components/admin/ui';
import { deleteRightsRequest, updateRightsRequest, watchRightsRequests, type RightsRequest } from '@/lib/admin/data';
import { RESPONSE_DAYS } from '@/lib/legal';
import { isErasureDue } from '@/lib/retention';
import { REQUEST_TYPES } from '@/lib/rightsRequestForm';

const DAY = 24 * 60 * 60 * 1000;
const typeLabel = (t: string) => REQUEST_TYPES.find((x) => x.value === t)?.label ?? t;
const isOpen = (r: RightsRequest) => r.status === 'new' || r.status === 'in_progress';

export default function RightsRequestsPage() {
  const [requests, setRequests] = useState<RightsRequest[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => watchRightsRequests(setRequests, (e) => setError(e.message || 'Could not load requests.')), []);

  const open = requests?.filter(isOpen).length ?? 0;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Privacy requests" subtitle={`${open} open. Answer within ${RESPONSE_DAYS} days. Contact the person directly, then record what you did here.`} />
      {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</p>}
      {requests !== null && requests.length === 0 && !error && (
        <Panel>
          <Empty title="No requests yet" />
        </Panel>
      )}
      {requests?.map((r) => <RequestCard key={`${r.id}:${r.status}`} request={r} />)}
    </div>
  );
}

function RequestCard({ request: r }: { request: RightsRequest }) {
  const [status, setStatus] = useState(r.status);
  const [response, setResponse] = useState(r.response);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const daysLeft = r.at ? RESPONSE_DAYS - Math.floor((Date.now() - r.at.getTime()) / DAY) : RESPONSE_DAYS;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{typeLabel(r.type)}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Received {fmtDate(r.at, true)}</p>
        </div>
        {isOpen(r) && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${daysLeft <= 5 ? 'bg-error/10 text-error' : 'bg-ink/5 text-ink-soft'}`}>
            {daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days overdue`}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-ink">{r.name} · {r.contact}{r.shopName ? ` · ${r.shopName}` : ''}{r.uid ? ' · has a login' : ''}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{r.details}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as RightsRequest['status'])} disabled={busy} className="h-10 rounded-xl border border-border bg-canvas px-3 text-sm text-ink">
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
          <option value="rejected">Refused</option>
        </select>
        <textarea aria-label="What was done" value={response} onChange={(e) => setResponse(e.target.value)} maxLength={1000} rows={2} disabled={busy} placeholder="What you did or told them" className="min-h-10 flex-1 rounded-xl border border-border bg-canvas p-2.5 text-sm text-ink outline-none focus:border-primary" />
        <button type="button" disabled={busy} onClick={() => void run(() => updateRightsRequest(r.id, status, response))} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">
          Save
        </button>
        {!isOpen(r) && isErasureDue(r.respondedAt) && (
          <button type="button" disabled={busy} onClick={() => void run(() => deleteRightsRequest(r.id))} className="h-10 rounded-xl border border-error/30 px-4 text-sm font-medium text-error">
            Erase
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </Panel>
  );
}
