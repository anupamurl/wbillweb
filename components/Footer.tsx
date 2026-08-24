import Link from 'next/link';
import WbillMark from './WbillMark';
import { brand } from '@/lib/brand';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <WbillMark size={24} />
              <span className="text-base font-semibold tracking-tight text-text-primary">wbill</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">Your bill, ready to send in seconds.</p>
            <div className="mt-4 flex gap-2">
              <span
                aria-disabled="true"
                title="Coming soon"
                className="rounded-md border border-border px-3 py-1.5 text-xs text-text-disabled"
              >
                App Store — coming soon
              </span>
              <span
                aria-disabled="true"
                title="Coming soon"
                className="rounded-md border border-border px-3 py-1.5 text-xs text-text-disabled"
              >
                Google Play — coming soon
              </span>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-secondary sm:grid-cols-1">
            <Link href="/invoice-format" className="hover:text-text-primary">Invoice formats</Link>
            <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-text-primary">Terms</Link>
            <Link href="/support" className="hover:text-text-primary">Support</Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-text-secondary sm:flex-row sm:justify-between">
          <span>&copy; {year} wbill. All rights reserved.</span>
          <a href={`mailto:${brand.email}`} className="hover:text-text-primary">{brand.email}</a>
        </div>
      </div>
    </footer>
  );
}
