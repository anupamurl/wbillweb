'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import WbillMark from './WbillMark';
import Icon from './Icon';
import { signOutEverywhere, useSession } from '@/lib/session';
import { primaryNav } from '@/lib/site';
import { useIsAdmin } from '@/lib/admin/data';

/**
 * A fixed 64px bar: transparent over the page top, frosted once it scrolls.
 *
 * The one auth-dependent part is on the right. Signed out: Login and Get
 * Started. Signed in: Dashboard and Logout. While Firebase is still
 * deciding, the slot holds its width so nothing shifts. Marketing pages
 * never load Firebase unless this browser has signed in before.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const session = useSession();
  const signedIn = session.status === 'signedIn';
  const isAdmin = useIsAdmin(signedIn ? session.user.uid : null);
  const deciding = session.status === 'unknown' || (signedIn && isAdmin === null);
  const homeHref = isAdmin ? '/administrator/' : '/dashboard/';

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  async function logout() {
    setOpen(false);
    setSigningOut(true);
    try {
      await signOutEverywhere();
    } finally {
      setSigningOut(false);
    }
  }

  const isCurrent = (href: string) => !href.includes('#') && pathname?.startsWith(href.replace(/\/$/, ''));

  return (
    <header className="sticky top-0 z-50 h-16">
      <div className="wb-header-bar h-full" data-scrolled={scrolled} data-open={open}>
        <div className="wb-container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="WBill home">
            <WbillMark size={28} />
            <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-ink">WBill</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className="rounded-full px-3.5 py-2 text-[0.9rem] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <div className={`hidden items-center gap-1.5 sm:flex ${deciding ? 'invisible' : ''}`} aria-hidden={deciding || undefined}>
              {signedIn ? (
                <>
                  <button type="button" onClick={logout} disabled={signingOut} className="wb-btn wb-btn-sm wb-btn-ghost">
                    {signingOut ? 'Logging out…' : 'Logout'}
                  </button>
                  <Link href={homeHref} className="wb-btn wb-btn-sm wb-btn-ink group">
                    {isAdmin ? 'Admin panel' : 'Dashboard'}
                    <Icon name="arrow" className="wb-arrow h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login/" className="wb-btn wb-btn-sm wb-btn-ghost">
                    Login
                  </Link>
                  <Link href="/signup/" className="wb-btn wb-btn-sm wb-btn-primary group">
                    Get Started
                    <Icon name="arrow" className="wb-arrow h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
              className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink lg:hidden"
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-[1.5px] w-5 rounded bg-current transition-transform duration-300 ${open ? 'translate-y-[5.25px] rotate-45' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-[1.5px] w-5 rounded bg-current transition-transform duration-300 ${open ? '-translate-y-[5.25px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>

        <div id="mobile-nav" className="wb-sheet lg:hidden" data-open={open}>
          <div>
            <nav aria-label="Mobile" inert={!open} className="wb-container flex h-[calc(100dvh-4rem)] flex-col bg-canvas pb-8 pt-4">
              <ul className="flex flex-col">
                {primaryNav.map((link, index) => (
                  <li
                    key={link.href}
                    className={`border-b border-line transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
                    style={{ transitionDelay: open ? `${80 + index * 40}ms` : '0ms' }}
                  >
                    <Link href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 text-2xl font-medium tracking-[-0.03em] text-ink">
                      {link.label}
                      <Icon name="arrow" className="h-5 w-5 text-ink-faint" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2.5">
                {signedIn ? (
                  <>
                    <Link href={homeHref} onClick={() => setOpen(false)} className="wb-btn wb-btn-lg wb-btn-ink w-full">
                      {isAdmin ? 'Go to admin panel' : 'Go to dashboard'}
                    </Link>
                    <button type="button" onClick={logout} disabled={signingOut} className="wb-btn wb-btn-lg wb-btn-secondary w-full">
                      {signingOut ? 'Logging out…' : 'Logout'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signup/" onClick={() => setOpen(false)} className="wb-btn wb-btn-lg wb-btn-primary w-full">
                      Get Started
                    </Link>
                    <Link href="/login/" onClick={() => setOpen(false)} className="wb-btn wb-btn-lg wb-btn-secondary w-full">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
