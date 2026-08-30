import Link from 'next/link';
import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';

const suggestions = [
  { href: '/', label: 'Home', detail: 'What wbill does, and how to get early access' },
  { href: '/invoice-format', label: 'Bill format guides', detail: 'Free, correct formats for Indian bills' },
  { href: '/support', label: 'Support', detail: 'Email us — we reply within one business day' },
];

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-24 sm:px-6">
      <p className="wb-in text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Error 404
      </p>
      <h1
        className="wb-in mt-3 text-3xl font-bold tracking-[-0.025em] text-text-primary sm:text-4xl"
        style={delay(60)}
      >
        This page isn’t here.
      </h1>
      <p className="wb-in mt-4 text-text-secondary" style={delay(120)}>
        The link may be out of date, or the page may have moved. Here is where most people were
        heading.
      </p>

      <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {suggestions.map((item, index) => (
          <li key={item.href} className="wb-in" style={delay(180 + index * 70)}>
            <Link
              href={item.href}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-variant"
            >
              <span>
                <span className="block text-base font-semibold text-text-primary">{item.label}</span>
                <span className="mt-0.5 block text-sm text-text-secondary">{item.detail}</span>
              </span>
              <Icon
                name="arrow"
                className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
