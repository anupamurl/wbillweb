'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardProvider, useDashboard } from '@/lib/DashboardContext';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ShopSetupForm from '@/components/dashboard/ShopSetupForm';
import { useSession } from '@/lib/session';
import { useIsAdmin } from '@/lib/admin/data';

/**
 * Protects every /dashboard/* route. A signed-out visitor is redirected to
 * /login?next=<page> and sent back here after they sign in. This only
 * decides what the browser shows — Firestore's own security rules are what
 * actually stop a user from reading anyone else's data.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = useSession({ eager: true });
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = useIsAdmin(session.status === 'signedIn' ? session.user.uid : null);

  useEffect(() => {
    if (session.status === 'signedOut') {
      const next = pathname && pathname !== '/dashboard' ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
    }
  }, [session.status, pathname, router]);

  // The super admin has no shop and can't make bills (Firestore rules
  // refuse it too), so every /dashboard/* page sends them to the panel.
  useEffect(() => {
    if (isAdmin) router.replace('/administrator/');
  }, [isAdmin, router]);

  if (session.status !== 'signedIn' || isAdmin !== false) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your account…</span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <DashboardProvider user={session.user}>
      <DashboardGate>{children}</DashboardGate>
    </DashboardProvider>
  );
}

function DashboardGate({ children }: { children: React.ReactNode }) {
  const { user, needsShopSetup, loading, error } = useDashboard();

  if (needsShopSetup) return <ShopSetupForm user={user} />;

  // A failed first load (permissions, network) would otherwise spin forever.
  if (loading && error) {
    return (
      <DashboardShell user={user}>
        <div role="alert" className="mx-auto max-w-md rounded-2xl border border-error/30 bg-error/5 p-6 text-center">
          <p className="font-semibold text-ink">We couldn&rsquo;t load your account</p>
          <p className="mt-2 text-sm text-ink-soft">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="wb-btn wb-btn-md wb-btn-primary mt-5">
            Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell user={user}>
        <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </DashboardShell>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
