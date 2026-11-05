'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardProvider, useDashboard } from '@/lib/DashboardContext';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ShopSetupForm from '@/components/dashboard/ShopSetupForm';
import { useSession } from '@/lib/session';

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

  useEffect(() => {
    if (session.status === 'signedOut') {
      const next = pathname && pathname !== '/dashboard' ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
    }
  }, [session.status, pathname, router]);

  if (session.status !== 'signedIn') {
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
  const { user, needsShopSetup, loading } = useDashboard();

  if (needsShopSetup) return <ShopSetupForm user={user} />;

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
