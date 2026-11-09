'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { signOutEverywhere, type SessionUser } from '@/lib/session';
import { formatPhone } from '@/lib/phone';

const nav: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: '/administrator/', label: 'Overview', icon: 'layers', match: (p) => p === '/administrator' || p === '/administrator/' },
  { href: '/administrator/users/', label: 'Users', icon: 'users', match: (p) => p.startsWith('/administrator/user') },
  { href: '/administrator/bills/', label: 'All bills', icon: 'receipt', match: (p) => p.startsWith('/administrator/bills') },
  { href: '/administrator/requests/', label: 'Privacy requests', icon: 'chat', match: (p) => p.startsWith('/administrator/requests') },
  { href: '/administrator/retention/', label: 'Retention', icon: 'clock', match: (p) => p.startsWith('/administrator/retention') },
  { href: '/administrator/segments/', label: 'Segments', icon: 'store', match: (p) => p.startsWith('/administrator/segments') },
];

export default function AdminShell({ user, lastUpdated, children }: { user: SessionUser; lastUpdated: Date | null; children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const identity = user.displayName || user.email || formatPhone(user.phoneNumber) || 'Administrator';

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await signOutEverywhere();
    router.replace('/');
  }

  const links = (
    <>
      <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">Platform</p>
      {nav.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active ? 'bg-primary/10 font-medium text-primary' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <p className="mt-6 px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">Account</p>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
      >
        <Icon name="key" className="h-4 w-4" />
        Log out
      </button>
    </>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="mx-auto flex max-w-[90rem] gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col">
            <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-canvas">
                  <Icon name="shield" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">Administrator</p>
                  <p className="truncate text-xs text-ink-soft">{identity}</p>
                </div>
              </div>
              <LiveBadge lastUpdated={lastUpdated} />
            </div>
            <nav aria-label="Administrator" className="flex flex-col gap-0.5">
              {links}
            </nav>
          </div>
        </aside>

        {/* Mobile bar */}
        <div className="fixed inset-x-0 top-16 z-30 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Icon name="shield" className="h-4 w-4 text-primary" />
              Administrator
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-ink"
            >
              <Icon name={open ? 'cross' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
          {open && (
            <nav aria-label="Administrator" className="mt-3 flex flex-col gap-0.5 pb-2">
              {links}
            </nav>
          )}
        </div>

        <main className="min-w-0 flex-1 pt-12 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}

function LiveBadge({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-2.5 py-1.5 text-[0.7rem] font-medium text-success">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      Live
      {lastUpdated && (
        <span className="ml-auto font-normal text-ink-soft">
          {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  );
}
