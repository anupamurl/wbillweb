'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import Icon from '@/components/Icon';
import { useDashboard } from '@/lib/DashboardContext';
import { formatPaise } from '@/lib/currency';
import { cleanNumber, formatPhone, isIndianMobile } from '@/lib/phone';
import { addEmployee, removeEmployee, TeamError, type Employee } from '@/lib/team';

/** Owner only (the dashboard layout sends employees away). */
export default function EmployeesPage() {
  const { shop, shopId, employees, bills } = useDashboard();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Employee | null>(null);

  const stats = useMemo(() => {
    const byUid = new Map<string, { count: number; total: number; last: Date | null }>();
    for (const b of bills) {
      if (!b.createdBy) continue;
      const s = byUid.get(b.createdBy) ?? { count: 0, total: 0, last: null };
      s.count += 1;
      s.total += b.grandTotal;
      if (!s.last || b.date > s.last) s.last = b.date;
      byUid.set(b.createdBy, s);
    }
    return byUid;
  }, [bills]);

  const teamUids = new Set(employees.map((e) => e.uid).filter(Boolean));
  const teamBills = bills.filter((b) => teamUids.has(b.createdBy));
  const active = employees.filter((e) => e.uid).length;

  if (!shop || !shopId) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="wb-display text-2xl text-ink sm:text-3xl">Employees</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            People who make bills for {shop.name}. Their bills use your shop name, logo and bill numbers.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="wb-btn wb-btn-md bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
          >
            + Add employee
          </button>
        )}
      </div>

      {adding && <AddEmployeeForm shopId={shopId} shopName={shop.name} onDone={() => setAdding(false)} />}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Employees" value={String(employees.length)} hint={`${active} signed in · ${employees.length - active} invited`} />
        <Stat label="Bills by your team" value={String(teamBills.length)} hint="All time" />
        <Stat label="Team sales" value={formatPaise(teamBills.reduce((s, b) => s + b.grandTotal, 0))} hint="All time" />
      </div>

      {employees.length === 0 ? (
        !adding && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="team" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">No employees yet</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              Add someone with their mobile number or Google email. They sign in with it and can start billing for your shop straight away.
            </p>
            <button type="button" onClick={() => setAdding(true)} className="wb-btn wb-btn-md mt-5 bg-primary text-white">
              Add your first employee
            </button>
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink-soft">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Bills</th>
                <th className="px-5 py-3 text-right font-medium">Sales</th>
                <th className="px-5 py-3 font-medium">Last bill</th>
                <th className="px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((e) => {
                const s = (e.uid && stats.get(e.uid)) || { count: 0, total: 0, last: null };
                return (
                  <tr key={e.id} className="align-middle">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {(e.name.trim()[0] ?? '?').toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{e.name}</p>
                          <p className="truncate text-xs text-ink-soft">
                            {[e.phone && formatPhone(e.phone), e.email].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {e.uid ? (
                        <span className="inline-flex flex-col">
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            Active
                          </span>
                          {e.lastLoginAt && <span className="mt-1 text-xs text-ink-soft">Seen {relativeDay(e.lastLoginAt)}</span>}
                        </span>
                      ) : (
                        <span className="inline-flex flex-col">
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-soft/60" />
                            Invited
                          </span>
                          <span className="mt-1 text-xs text-ink-soft">Hasn&rsquo;t signed in yet</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink">{s.count}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink">{formatPaise(s.total)}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{s.last ? relativeDay(s.last) : '—'}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {e.uid && s.count > 0 && (
                          <Link
                            href={`/dashboard/bills?by=${encodeURIComponent(e.uid)}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                          >
                            View bills
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setRemoving(e)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/10"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-canvas p-5 text-sm text-ink-soft">
        <p className="font-medium text-ink">How employees sign in</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>On wbill.app or in the WBill app, they sign in with the mobile number you added (OTP), or with &ldquo;Continue with Google&rdquo; using the email you added (website only).</li>
          <li>They can create bills and see the bills they made. They can&rsquo;t change shop details, the logo, or see your other bills.</li>
          <li>Removing someone stops their access at once. Bills they made stay in your records.</li>
        </ul>
      </div>

      {removing && (
        <RemoveDialog
          employee={removing}
          onCancel={() => setRemoving(null)}
          onConfirm={async () => {
            await removeEmployee(shopId, removing);
            setRemoving(null);
          }}
        />
      )}
    </div>
  );
}

function AddEmployeeForm({ shopId, shopName, onDone }: { shopId: string; shopName: string; onDone: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const digits = cleanNumber(phone);
    const mail = email.trim().toLowerCase();
    if (!name.trim()) return setError('Enter the employee’s name.');
    if (!digits && !mail) return setError('Add a mobile number or an email so they can sign in.');
    if (digits && !isIndianMobile(digits)) return setError('Enter a valid 10-digit Indian mobile number.');
    if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return setError('Enter a valid email address.');
    setSaving(true);
    setError('');
    try {
      await addEmployee(shopId, shopName, { name: name.trim().slice(0, 80), phone: digits, email: mail });
      onDone();
    } catch (err) {
      setError(err instanceof TeamError ? err.message : 'Could not add the employee. Try again.');
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">Add an employee</h2>
      <p className="mt-1 text-sm text-ink-soft">They&rsquo;ll sign in with the mobile number or Google email you enter here.</p>
      <form onSubmit={submit} className="mt-5 grid gap-3.5 sm:grid-cols-3">
        <Field label="Name" required>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ravi Kumar" className={inputClass} />
        </Field>
        <Field label="Mobile number">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={14} placeholder="98765 43210" className={inputClass} />
        </Field>
        <Field label="Google email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={254} placeholder="ravi@gmail.com" className={inputClass} />
        </Field>
        {error && <p className="text-sm text-error sm:col-span-3">{error}</p>}
        <div className="flex gap-2.5 sm:col-span-3">
          <button type="submit" disabled={saving} className="wb-btn wb-btn-md bg-primary text-white shadow-sm disabled:opacity-60">
            {saving ? 'Adding…' : 'Add employee'}
          </button>
          <button type="button" onClick={onDone} className="wb-btn wb-btn-md border border-border bg-surface text-ink">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function RemoveDialog({ employee, onCancel, onConfirm }: { employee: Employee; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="remove-title">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 id="remove-title" className="text-base font-semibold text-ink">
          Remove {employee.name}?
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          They&rsquo;ll lose access right away and can&rsquo;t make bills for your shop. Bills they already made stay in your records.
        </p>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onCancel} disabled={busy} className="wb-btn wb-btn-md border border-border bg-surface text-ink">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                await onConfirm();
              } catch {
                setError('Could not remove them. Check your connection and try again.');
                setBusy(false);
              }
            }}
            className="wb-btn wb-btn-md bg-error text-white disabled:opacity-60"
          >
            {busy ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>
    </div>
  );
}

function relativeDay(d: Date): string {
  const days = Math.floor((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

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
