'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WbillMark from './WbillMark';
import Icon from './Icon';

const navLinks = [
  { href: '/#product', label: 'Product' },
  { href: '/#features', label: 'Features' },
  { href: '/#industries', label: 'Industries' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

/**
 * The outer header keeps a fixed 64px box so nothing below it moves; only
 * the inner bar compacts, turns translucent and picks up a border on scroll.
 *
 * There is no web login yet — accounts live in the mobile app, which signs
 * in by phone OTP — so the bar carries one action, not a dead Login link.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 12);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const compact = scrolled || open;

  return (
    <header className="sticky top-0 z-40 h-16">
      <div
        className={`mx-auto transition-all duration-300 ease-out ${
          compact ? 'max-w-6xl px-2 pt-2 sm:px-4' : 'max-w-7xl px-0 pt-0'
        }`}
      >
        <div
          className={`border transition-all duration-300 ease-out ${
            compact
              ? 'rounded-2xl border-border bg-background/80 shadow-[0_8px_30px_-12px_rgb(10_22_51/0.18)] backdrop-blur-md backdrop-saturate-150'
              : 'rounded-none border-transparent border-b-border/60 bg-background/80 backdrop-blur-md'
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 transition-all duration-300 sm:px-6 ${
              compact ? 'h-12' : 'h-16'
            }`}
          >
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <WbillMark size={compact ? 26 : 30} />
              <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">WBill</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-1 text-sm lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="/#start"
                className="wb-cta wb-btn wb-btn-sm hidden bg-primary text-white sm:inline-flex"
              >
                Join early access
              </a>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface/70 text-ink lg:hidden"
              >
                <Icon
                  name="menu"
                  className={`absolute h-5 w-5 transition-all duration-300 ${open ? 'rotate-90 scale-50 opacity-0' : ''}`}
                />
                <Icon
                  name="cross"
                  className={`absolute h-5 w-5 transition-all duration-300 ${open ? '' : '-rotate-90 scale-50 opacity-0'}`}
                />
              </button>
            </div>
          </div>

          <div id="mobile-nav" className="wb-sheet lg:hidden" data-open={open}>
            <div>
              <nav aria-label="Mobile" className="px-3 pb-3" inert={!open}>
                <ul className="border-t border-border pt-2">
                  {navLinks.map((link, index) => (
                    <li
                      key={link.href}
                      className={`transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}
                      style={{ transitionDelay: open ? `${60 + index * 35}ms` : '0ms' }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-[0.95rem] text-ink transition-colors hover:bg-ink/5"
                      >
                        {link.label}
                        <Icon name="arrow" className="h-4 w-4 text-ink-soft" />
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href="/#start"
                  onClick={() => setOpen(false)}
                  className="wb-cta wb-btn wb-btn-md mt-2 flex w-full bg-primary text-white"
                >
                  Join early access
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
