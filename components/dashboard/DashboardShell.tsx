'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '@/components/Icon';
import WbillMark from '@/components/WbillMark';
import { signOutEverywhere } from '@/lib/session';
import { formatPhone } from '@/lib/phone';
import type { SessionUser } from '@/lib/session';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: 'layers' as const },
  { href: '/dashboard/bills', label: 'Bills', icon: 'receipt' as const },
  { href: '/dashboard/customers', label: 'Customers', icon: 'users' as const },
  { href: '/dashboard/insights', label: 'Insights', icon: 'chart' as const },
  { href: '/dashboard/profile', label: 'Profile', icon: 'store' as const },
];

export default function DashboardShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOutEverywhere();
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  }

  const identity = user.displayName || formatPhone(user.phoneNumber) || user.email || 'Your account';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:gap-10 lg:py-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Dashboard" className="sticky top-24 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-60"
            >
              <Icon name="cross" className="h-4 w-4" />
              {signingOut ? 'Logging out…' : 'Logout'}
            </button>
          </nav>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-16 z-30 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <WbillMark size={20} />
              <span className="truncate">{identity}</span>
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
            <nav aria-label="Dashboard" className="mt-2 flex flex-col gap-1 pb-2">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} onClick={() => setOpen(false)} />
              ))}
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
              >
                <Icon name="cross" className="h-4 w-4" />
                {signingOut ? 'Logging out…' : 'Logout'}
              </button>
            </nav>
          )}
        </div>

        <main className="min-w-0 flex-1 pt-12 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}

function isActive(pathname: string | null, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/';
  return pathname?.startsWith(href) ?? false;
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: { href: string; label: string; icon: 'layers' | 'receipt' | 'users' | 'chart' | 'store' };
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active ? 'bg-primary/10 font-medium text-primary' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
      }`}
    >
      <Icon name={item.icon} className="h-4 w-4" />
      {item.label}
    </Link>
  );
}
