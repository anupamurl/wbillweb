import Link from 'next/link';
import Icon from '@/components/Icon';
import { Eyebrow } from '@/components/landing/primitives';
import { delay } from '@/lib/motion';

const suggestions = [
  { href: '/', label: 'Home', detail: 'What WBill does, and how to get started' },
  { href: '/pricing/', label: 'Pricing', detail: 'Plans, starting free' },
  { href: '/login/', label: 'Login', detail: 'Phone number or Google account' },
  { href: '/support/', label: 'Support', detail: 'Email us — we reply within one business day' },
];

export default function NotFound() {
  return (
    <main className="wb-container flex min-h-[70vh] flex-col justify-center py-24">
      <Eyebrow className="wb-in">Error 404</Eyebrow>
      <h1 className="wb-in wb-h2 mt-5 max-w-2xl text-ink" style={delay(60)}>
        This page doesn’t have a record.
      </h1>
      <p className="wb-in wb-lead mt-5 max-w-xl" style={delay(120)}>
        The link may be out of date, or the page may have moved. Here’s where most people were heading.
      </p>

      <ul className="mt-12 max-w-2xl border-t border-line">
        {suggestions.map((item, index) => (
          <li key={item.href} className="wb-in border-b border-line" style={delay(180 + index * 60)}>
            <Link href={item.href} className="group flex items-center justify-between gap-4 py-5">
              <span>
                <span className="block font-semibold text-ink">{item.label}</span>
                <span className="mt-0.5 block text-sm text-ink-soft">{item.detail}</span>
              </span>
              <Icon name="arrow" className="wb-arrow h-4 w-4 shrink-0 text-ink" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
