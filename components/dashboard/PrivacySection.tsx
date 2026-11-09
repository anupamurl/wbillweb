'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDashboard } from '@/lib/DashboardContext';
import { withdrawConsent } from '@/lib/consent';
import { downloadBillsCsv, downloadMyData } from '@/lib/privacyData';

/** Download, rights and withdrawal: the DPDP controls every login gets. */
export default function PrivacySection() {
  const { user, isOwner, shop, bills, employees } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  async function download() {
    setBusy(true);
    setError('');
    try {
      await downloadMyData({
        uid: user.uid,
        isOwner,
        account: { phoneNumber: user.phoneNumber, email: user.email, displayName: user.displayName },
        shop,
        bills,
        employees,
      });
    } catch {
      setError('Could not prepare your data. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    setError('');
    try {
      await withdrawConsent(user.uid, 'en');
    } catch {
      setError('Could not withdraw your consent. Check your connection and try again.');
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">Your data and privacy</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Download a copy of your data, or read how to correct or erase it, nominate someone, or raise a grievance on{' '}
        <Link href="/your-data/" className="font-medium text-primary hover:underline">
          Your data rights
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={download} disabled={busy} className="wb-btn wb-btn-md border border-border bg-surface text-ink hover:border-primary/50 disabled:opacity-60">
          Download my data
        </button>
        <button type="button" onClick={() => downloadBillsCsv(bills)} disabled={busy || bills.length === 0} className="wb-btn wb-btn-md border border-border bg-surface text-ink hover:border-primary/50 disabled:opacity-60">
          Download bills (CSV)
        </button>
        <button type="button" onClick={() => setConfirming(true)} disabled={busy} className="wb-btn wb-btn-md border border-border bg-surface text-ink-soft hover:text-ink disabled:opacity-60">
          Withdraw consent
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="withdraw-title">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2 id="withdraw-title" className="text-base font-semibold text-ink">Withdraw your consent?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              You won&rsquo;t be able to use WBill until you consent again, and we&rsquo;ll stop using your data. Your bills aren&rsquo;t erased. To
              erase them, delete your account below instead.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="wb-btn wb-btn-md text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button type="button" onClick={withdraw} disabled={busy} className="wb-btn wb-btn-md bg-error text-white disabled:opacity-60">
                {busy ? 'Withdrawing…' : 'Withdraw consent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
