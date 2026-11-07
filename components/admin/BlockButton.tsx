'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { blockUser, unblockUser } from '@/lib/admin/data';

/** Block / unblock a user, after a confirmation dialog. */
export default function BlockButton({ uid, name, blocked, compact = false }: { uid: string; name: string; blocked: boolean; compact?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await (blocked ? unblockUser(uid) : blockUser(uid));
      setOpen(false);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      const stepName = (e as { step?: string })?.step;
      setError(
        code === 'permission-denied'
          ? `Firestore refused this${stepName ? ` (while ${stepName})` : ''}. New rules can take up to 10 minutes to apply — wait a few minutes and try again.`
          : `Couldn’t finish${stepName ? ` (while ${stepName})` : ''}: ${code ?? 'unknown error'}. Try again — anything already removed stays removed.`,
      );
    } finally {
      setBusy(false);
    }
  }

  const allowed = !blocked;

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={allowed}
        aria-label={`Access for ${name}`}
        title={allowed ? 'Access allowed — switch off to block' : 'Blocked — switch on to restore access'}
        onClick={(e) => {
          e.stopPropagation();
          setError('');
          setOpen(true);
        }}
        className={`group inline-flex items-center gap-2 rounded-full font-medium ${compact ? 'text-xs' : 'h-10 rounded-xl border border-border bg-surface px-3.5 text-sm'}`}
      >
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 ${
            allowed ? 'bg-success' : 'bg-error'
          }`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${allowed ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`} />
        </span>
        <span className={`w-14 text-left ${allowed ? 'text-success' : 'text-error'}`}>{allowed ? 'Allowed' : 'Blocked'}</span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === dialogRef.current && !busy) setOpen(false);
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-left text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="p-6">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${blocked ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
            <Icon name="shield" className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">{blocked ? `Unblock ${name}?` : `Block ${name}?`}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {blocked
              ? 'They’ll be able to sign in and use their shop, bills and customers again.'
              : 'They’ll be signed out of every browser right away and see “You’ve been blocked by the administrator”. Their shop and bills are kept, but they can’t open or change them until you unblock them.'}
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setOpen(false)} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={confirm}
              className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60 ${blocked ? 'bg-primary hover:bg-primary/90' : 'bg-error hover:bg-error/90'}`}
            >
              {busy ? 'Saving…' : blocked ? 'Unblock user' : 'Block user'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
