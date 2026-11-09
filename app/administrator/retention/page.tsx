'use client';

import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import Modal from '@/components/admin/Modal';
import { Empty, fmtDate, PageHeader, Panel } from '@/components/admin/ui';
import { eraseAccount, recordRetentionNotice, type ClosedAccount } from '@/lib/admin/data';
import { userRows } from '@/lib/admin/stats';
import { ERASURE_NOTICE_HOURS, INACTIVE_YEARS, RETENTION_DAYS } from '@/lib/legal';
import { maskPhone } from '@/lib/phone';
import { isErasureDue, isInactive, lastActivity, noticeHasRun, retainUntil } from '@/lib/retention';

type Target = { uid: string; name: string; closedByAdmin: boolean };

const eraseBtn =
  'rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 disabled:cursor-not-allowed disabled:border-border disabled:text-ink-faint';

export default function RetentionPage() {
  const { closed, shops, bills, logins, notices } = useAdmin();
  const [erasing, setErasing] = useState<Target | null>(null);
  const [error, setError] = useState('');

  const queue = useMemo(() => [...closed].sort((a, b) => (a.requestedAt?.getTime() ?? 0) - (b.requestedAt?.getTime() ?? 0)), [closed]);

  const inactive = useMemo(() => {
    const lastLogin = new Map<string, Date>();
    for (const l of logins) if (l.at && (!lastLogin.has(l.uid) || l.at > lastLogin.get(l.uid)!)) lastLogin.set(l.uid, l.at);
    return userRows(shops, bills)
      .map((row) => ({ row, last: lastActivity([row.lastBillAt, lastLogin.get(row.shop.id), row.shop.createdAt]) }))
      .filter((x) => isInactive(x.last));
  }, [shops, bills, logins]);

  async function warn(uid: string, phone: string, name: string) {
    setError('');
    const digits = phone.replace(/\D/g, '').slice(-10);
    try {
      await recordRetentionNotice(uid);
      const text = `WBill: your account for ${name} has had no activity for ${INACTIVE_YEARS} years and will be erased in ${ERASURE_NOTICE_HOURS} hours. To keep it, sign in at wbill.app. To save your bills first, use Download bills in Profile.`;
      if (digits) window.open(`https://wa.me/91${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } catch {
      setError('Could not record the notice. Nothing was sent.');
    }
  }

  const th = 'px-4 py-3 text-left font-medium';
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Retention"
        subtitle={`Closed accounts are held for ${RETENTION_DAYS} days, then must be erased (DPDP Rule 8(3)). Check this page at least monthly.`}
      />
      {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</p>}

      <Panel title="Closed accounts" flush>
        {queue.length === 0 ? (
          <Empty title="No closed accounts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-canvas text-xs text-ink-soft">
                <tr>
                  <th className={th}>Account</th>
                  <th className={th}>Closed</th>
                  <th className={th}>Erase from</th>
                  <th className="px-4 py-3"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.map((c: ClosedAccount) => {
                  const due = isErasureDue(c.requestedAt);
                  return (
                    <tr key={c.uid}>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{c.shopName || (c.role === 'employee' ? 'Employee login' : 'Unnamed shop')}</span>
                        <span className="block font-mono text-[0.7rem] text-ink-faint">{c.uid}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(c.requestedAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{c.requestedAt ? fmtDate(retainUntil(c.requestedAt)) : 'Pending'}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" disabled={!due} onClick={() => setErasing({ uid: c.uid, name: c.shopName || c.uid, closedByAdmin: c.role === 'admin' })} className={eraseBtn}>
                          {due ? 'Erase now' : 'Held'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Inactive for ${INACTIVE_YEARS}+ years`} flush>
        {inactive.length === 0 ? (
          <Empty title="No inactive accounts" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-canvas text-xs text-ink-soft">
                <tr>
                  <th className={th}>Shop</th>
                  <th className={th}>Last activity</th>
                  <th className={th}>Owner warned</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inactive.map(({ row, last }) => {
                  const notifiedAt = notices.get(row.shop.id) ?? null;
                  return (
                    <tr key={row.shop.id}>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{row.shop.name}</span>
                        <span className="block text-xs text-ink-soft">{maskPhone(row.shop.ownerPhone)}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(last)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{notifiedAt ? fmtDate(notifiedAt, true) : 'Not yet'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button type="button" onClick={() => void warn(row.shop.id, row.shop.ownerPhone, row.shop.name)} className="mr-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5">
                          {notifiedAt ? 'Warn again' : 'Warn owner'}
                        </button>
                        <button type="button" disabled={!noticeHasRun(notifiedAt)} onClick={() => setErasing({ uid: row.shop.id, name: row.shop.name, closedByAdmin: true })} className={eraseBtn}>
                          Erase
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {erasing && <EraseDialog target={erasing} onClose={() => setErasing(null)} />}
    </div>
  );
}

function EraseDialog({ target, onClose }: { target: Target; onClose: () => void }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const matches = typed.trim().toLowerCase() === target.name.trim().toLowerCase();

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await eraseAccount(target.uid);
      onClose();
    } catch (e) {
      setError((e as Error).message || 'Could not finish. Try again. Anything already erased stays erased.');
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={busy} labelledBy="erase-title">
      <div className="p-6">
        <h2 id="erase-title" className="text-lg font-semibold text-ink">Erase {target.name}?</h2>
        <p className="mt-2 text-sm text-ink-soft">This permanently erases the shop, bills, team records, login history and consent records. It can&rsquo;t be undone.</p>
        {target.closedByAdmin && (
          <p className="mt-2 text-sm text-ink-soft">Afterwards, also delete this user in the Firebase console (Authentication, Users), because the website can&rsquo;t remove someone else&rsquo;s login.</p>
        )}
        <label className="mt-4 block text-sm font-medium text-ink">
          Type <span className="rounded bg-ink/5 px-1 font-mono">{target.name}</span> to confirm
          <input value={typed} onChange={(e) => setTyped(e.target.value)} disabled={busy} autoComplete="off" className="mt-2 h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm outline-none focus:border-error" />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">Cancel</button>
          <button type="button" disabled={!matches || busy} onClick={() => void confirm()} className="h-10 rounded-xl bg-error px-4 text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-50">
            {busy ? 'Erasing…' : 'Erase permanently'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
