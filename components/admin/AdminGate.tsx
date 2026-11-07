'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, type SessionUser } from '@/lib/session';
import { checkIsAdmin, useAdminData, type AdminData } from '@/lib/admin/data';
import AdminShell from './AdminShell';

type AdminContextValue = AdminData & { user: SessionUser };
const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside /administrator.');
  return ctx;
}

/**
 * Guards /administrator/*: signed-out visitors go to /login, signed-in
 * non-admins see "access denied". This only decides what the browser
 * shows; Firestore rules are what actually refuse a non-admin's reads.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession({ eager: true });
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<'checking' | 'yes' | 'no'>('checking');
  const uid = session.status === 'signedIn' ? session.user.uid : null;

  useEffect(() => {
    if (session.status === 'signedOut') router.replace(`/login?next=${encodeURIComponent(pathname || '/administrator/')}`);
  }, [session.status, pathname, router]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setAdmin('checking');
    void checkIsAdmin(uid).then((ok) => !cancelled && setAdmin(ok ? 'yes' : 'no'));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const data = useAdminData(admin === 'yes');

  if (session.status !== 'signedIn' || admin === 'checking') return <FullSpinner label="Checking administrator access…" />;
  if (admin === 'no') return <AccessDenied uid={session.user.uid} />;

  return (
    <AdminContext.Provider value={{ ...data, user: session.user }}>
      <AdminShell user={session.user} lastUpdated={data.lastUpdated}>
        {data.error ? (
          <div role="alert" className="rounded-xl border border-error/30 bg-error/5 p-5 text-sm text-error">
            {data.error}
          </div>
        ) : data.loading ? (
          <FullSpinner label="Loading platform data…" inline />
        ) : (
          children
        )}
      </AdminShell>
    </AdminContext.Provider>
  );
}

function FullSpinner({ label, inline }: { label: string; inline?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${inline ? 'min-h-[50vh]' : 'min-h-[calc(100vh-4rem)]'}`} aria-busy="true">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}

function AccessDenied({ uid }: { uid: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
            <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-semibold text-ink">Administrator access required</h1>
        <p className="mt-2 text-sm text-ink-soft">
          This account isn&rsquo;t an administrator. To grant access, create a Firestore document at{' '}
          <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-xs">admins/&lt;your uid&gt;</code> in the Firebase console.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-left">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{uid}</code>
          <button
            type="button"
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={() => {
              void navigator.clipboard?.writeText(uid).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? 'Copied' : 'Copy uid'}
          </button>
        </div>
        <a href="/dashboard/" className="wb-btn wb-btn-md wb-btn-primary mt-6 w-full">
          Back to my dashboard
        </a>
      </div>
    </div>
  );
}
