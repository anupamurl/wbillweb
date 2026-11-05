import Link from 'next/link';
import WbillMark from './WbillMark';
import { brand } from '@/lib/brand';
import { social } from '@/lib/social';

const columns = [
  {
    heading: 'Product',
    links: [
      { href: '/#product', label: 'Product' },
      { href: '/#features', label: 'Features' },
      { href: '/#industries', label: 'Who it’s for' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Free guides',
    links: [
      { href: '/invoice-format/#group-shop', label: 'Shop bill formats' },
      { href: '/invoice-format/#group-service', label: 'Service bill formats' },
      { href: '/invoice-format/simple-bill-format', label: 'Bill format without GST' },
      { href: '/invoice-format', label: 'All bill formats' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/support', label: 'Support' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <WbillMark size={28} />
              <span className="text-base font-semibold tracking-[-0.02em] text-ink">wbill</span>
              <span className="text-sm text-text-secondary">· Digital Billing App</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
              Digital bills on WhatsApp for every small shop and service business in India.
              <span className="mt-1 block" lang="hi-Latn">Phone se bill banao, WhatsApp pe bhejo.</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['App Store', 'Google Play'].map((store) => (
                <span
                  key={store}
                  aria-disabled="true"
                  title="Coming soon"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-text-disabled"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-text-disabled" />
                  {store} — coming soon
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-sm font-semibold text-ink">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-text-secondary">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith('/#') ? (
                        <a href={link.href} className="transition-colors hover:text-text-primary">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="transition-colors hover:text-text-primary">
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

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} wbill. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {social.map((account) => (
              <a
                key={account.id}
                href={account.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-text-primary"
              >
                {account.label} {account.handle}
              </a>
            ))}
            <span>Made in India</span>
            <a href={`mailto:${brand.email}`} className="transition-colors hover:text-text-primary">
              {brand.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
