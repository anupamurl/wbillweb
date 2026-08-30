import Link from 'next/link';
import WbillMark from './WbillMark';
import Icon from './Icon';

const navLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#who-its-for', label: "Who it's for" },
  { href: '/invoice-format', label: 'Invoice formats' },
  { href: '/#faq', label: 'FAQ' },
];

function NavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const props = { className, children: label };
  return href.startsWith('/#') ? <a href={href} {...props} /> : <Link href={href} {...props} />;
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <WbillMark size={30} />
          <span className="text-lg font-semibold tracking-[-0.02em] text-text-primary">wbill</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-sm text-text-secondary lg:flex"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              className="wb-link transition-colors hover:text-text-primary"
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/#waitlist"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md hover:shadow-primary/25"
          >
            Get early access
          </a>

          {/* Mobile menu. `details` keeps this a server component with no JS. */}
          <details className="group relative lg:hidden">
            <summary
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-text-secondary"
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-5 w-5 group-open:hidden" />
              <Icon name="cross" className="hidden h-5 w-5 group-open:block" />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-variant hover:text-text-primary"
                />
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
