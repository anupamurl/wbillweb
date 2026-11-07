'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, type SessionUser } from '@/lib/session';
import { checkIsAdmin, useAdminData, type AdminData } from '@/lib/admin/data';
import NotFound from '@/app/not-found';
import AdminShell from './AdminShell';

type AdminContextValue = AdminData & { user: SessionUser };
const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside /administrator.');
  return ctx;
}

/**
 * Guards /administrator/*. Signed-out visitors get the ordinary 404 page,
 * so the panel's existence isn't advertised. Signed-in non-admins are sent
 * to their dashboard. Neither case reveals who the administrator is.
 * This only decides what the browser shows; Firestore rules are what
 * actually refuse a non-admin's reads.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const session = useSession({ eager: true });
  const router = useRouter();
  const [admin, setAdmin] = useState<'checking' | 'yes' | 'no'>('checking');
  const uid = session.status === 'signedIn' ? session.user.uid : null;

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setAdmin('checking');
    void checkIsAdmin().then((ok) => !cancelled && setAdmin(ok ? 'yes' : 'no'));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    if (admin === 'no') router.replace('/dashboard/');
  }, [admin, router]);

  const data = useAdminData(admin === 'yes');

  if (session.status === 'signedOut') return <NotFound />;
  if (session.status !== 'signedIn' || admin !== 'yes') return <FullSpinner />;

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

function FullSpinner({ label, inline }: { label?: string; inline?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${inline ? 'min-h-[50vh]' : 'min-h-[calc(100vh-4rem)]'}`} aria-busy="true">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label && <p className="text-sm text-ink-soft">{label}</p>}
    </div>
  );
}
