import Link from 'next/link';
import WbillMark from './WbillMark';

const navLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#who-its-for', label: "Who it's for" },
  { href: '/#faq', label: 'FAQ' },
  { href: '/invoice-format', label: 'Invoice formats' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <WbillMark size={28} />
          <span className="text-lg font-semibold tracking-tight text-text-primary">wbill</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
          {navLinks.map((link) =>
            link.href.startsWith('/#') ? (
              <a key={link.href} href={link.href} className="hover:text-text-primary">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-text-primary">
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <a
          href="/#waitlist"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Get early access
        </a>
      </div>
    </header>
  );
}
