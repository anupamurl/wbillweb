'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { deleteUserData } from '@/lib/admin/data';

/**
 * Permanently deletes a user's shop, bills, login history and block record.
 * The admin has to type the shop name to confirm.
 */
export default function DeleteUserButton({
  uid,
  name,
  bills,
  compact = false,
  onDeleted,
}: {
  uid: string;
  name: string;
  bills: number;
  compact?: boolean;
  onDeleted?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function confirm() {
    if (!matches || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteUserData(uid);
      setOpen(false);
      onDeleted?.();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === 'permission-denied'
          ? 'Firestore refused this. Publish the latest firestore.rules, then try again.'
          : 'Couldn’t finish deleting. Some data may already be gone — try again to remove the rest.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setTyped('');
          setError('');
          setOpen(true);
        }}
        aria-label={`Delete ${name}`}
        title="Delete user permanently"
        className={
          compact
            ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-error/10 hover:text-error'
            : 'inline-flex h-10 items-center gap-2 rounded-xl border border-error/30 bg-surface px-3.5 text-sm font-medium text-error transition-colors hover:bg-error/5'
        }
      >
        <TrashIcon className="h-4 w-4" />
        {!compact && 'Delete user'}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => !busy && setOpen(false)}
        onCancel={(e) => busy && e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === dialogRef.current && !busy) setOpen(false);
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-left text-ink shadow-xl backdrop:bg-ink/40"
      >
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-error/10 text-error">
            <TrashIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Delete {name} permanently?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">This removes everything for this user from the database. It can&rsquo;t be undone:</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
            <li>Shop profile and settings</li>
            <li>
              All <span className="font-medium text-ink">{bills.toLocaleString('en-IN')}</span> bills and their customer details
            </li>
            <li>Login history and any block</li>
          </ul>
          <p className="mt-2 text-sm text-ink-soft">If they&rsquo;re signed in, they&rsquo;ll be signed out and told their account was deleted.</p>

          <label htmlFor={`del-${uid}`} className="mt-5 block text-sm font-medium">
            Type <span className="rounded bg-ink/5 px-1 font-mono">{name}</span> to confirm
          </label>
          <input
            id={`del-${uid}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            disabled={busy}
            className="mt-2 h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm outline-none focus:border-error"
          />
          {error && (
            <p role="alert" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setOpen(false)} className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-ink/5">
              Cancel
            </button>
            <button type="submit" disabled={!matches || busy} className="h-10 rounded-xl bg-error px-4 text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-50">
              {busy ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />
    </svg>
  );
}
