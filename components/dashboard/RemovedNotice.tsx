'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import WbillMark from '@/components/WbillMark';
import { useDashboard } from '@/lib/DashboardContext';
import { signOutEverywhere } from '@/lib/session';
import { leaveShop } from '@/lib/team';

/** Shown to an employee whose owner removed them from the team. */
export default function RemovedNotice() {
  const router = useRouter();
  const { user, removedFrom, reresolve } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function startOwnShop() {
    setBusy(true);
    setError('');
    try {
      await leaveShop(user.uid);
      reresolve();
    } catch {
      setError('Could not continue. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
        <div className="flex justify-center">
          <WbillMark size={36} />
        </div>
        <h1 className="wb-display mt-4 text-2xl text-ink">You&rsquo;re no longer on this team</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {removedFrom ? `${removedFrom} removed you` : 'The shop owner removed you'}, so you can&rsquo;t make bills for them any more. If
          this is a mistake, ask the owner to add you again.
        </p>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => signOutEverywhere().then(() => router.replace('/'))}
            className="wb-btn wb-btn-md bg-primary text-white"
          >
            Log out
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={startOwnShop}
            className="wb-btn wb-btn-md border border-border bg-surface text-ink disabled:opacity-60"
          >
            {busy ? 'One moment…' : 'Set up my own shop instead'}
          </button>
        </div>
      </div>
    </main>
  );
}
