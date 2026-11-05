import Link from 'next/link';
import WbillMark from './WbillMark';
import { footerNav, site } from '@/lib/site';
import { social } from '@/lib/social';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="wb-container pb-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg" aria-label="WBill home">
              <WbillMark size={28} />
              <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-ink">WBill</span>
            </Link>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
              {site.tagline} Digital billing and purchase records for businesses of every kind.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" aria-hidden="true" />
              Mobile app for iOS and Android — coming soon
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerNav.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-sm font-medium text-ink">{column.heading}</p>
                <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith('mailto:') ? (
                        <a href={link.href} className="transition-colors hover:text-ink">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="transition-colors hover:text-ink">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p aria-hidden="true" className="pointer-events-none mt-20 select-none text-[clamp(4.5rem,19vw,15rem)] font-semibold leading-[0.8] tracking-[-0.07em] text-ink/[0.06]">
          WBill
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} WBill. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {social.map((account) => (
              <a key={account.id} href={account.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
                {account.label}
              </a>
            ))}
            <a href={`mailto:${site.email}`} className="transition-colors hover:text-ink">
              {site.email}
            </a>
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
