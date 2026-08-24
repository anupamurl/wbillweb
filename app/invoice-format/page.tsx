import type { Metadata } from 'next';
import Link from 'next/link';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Invoice & Bill Formats',
  description:
    'Free, correct bill and invoice formats for Indian small businesses — GST invoices, and formats for electricians, plumbers, AC service, and freelancers.',
  alternates: { canonical: `${brand.url}/invoice-format/` },
};

export default function InvoiceFormatHub() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Invoice & bill formats</h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        Free reference guides for getting a bill right — what has to be on it, a worked example with
        real numbers, and the mistakes that trip people up most.
      </p>
      <ul className="mt-10 divide-y divide-border border-t border-border">
        {invoiceFormatGuides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/invoice-format/${guide.slug}`} className="block py-5 hover:bg-surface-variant">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{guide.audience}</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{guide.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{guide.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
