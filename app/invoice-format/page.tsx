import type { Metadata } from 'next';
import Link from 'next/link';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import Icon from '@/components/Icon';
import { brand } from '@/lib/brand';
import { delay } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Invoice & Bill Formats — Free Guides for Indian Small Businesses',
  description:
    'Free, correct bill and invoice formats for Indian small businesses — the GST invoice format, plus formats for electricians, plumbers, AC service and freelancers.',
  alternates: { canonical: `${brand.url}/invoice-format/` },
};

export default function InvoiceFormatHub() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Invoice formats', path: '/invoice-format/' },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="wb-in text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Free reference
        </p>
        <h1
          className="wb-in mt-3 text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl"
          style={delay(60)}
        >
          Invoice &amp; bill formats
        </h1>
        <p
          className="wb-in mt-5 max-w-2xl text-lg leading-relaxed text-text-secondary"
          style={delay(120)}
        >
          Getting a bill right is mostly about knowing what has to be on it. Each guide below gives
          you the required fields, a worked example with real numbers, and the mistakes that trip
          people up most — no signup, no download.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {invoiceFormatGuides.map((guide, index) => (
            <Link
              key={guide.slug}
              href={`/invoice-format/${guide.slug}`}
              className="wb-card wb-reveal group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
              style={delay((index % 2) * 70)}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {guide.audience}
                </p>
                <p className="mt-2.5 text-lg font-semibold tracking-[-0.01em] text-text-primary">
                  {guide.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {guide.description}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Read the guide
                <Icon
                  name="arrow"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="wb-reveal mt-14 rounded-2xl border border-primary/25 bg-surface-variant/60 p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
            Or stop formatting bills by hand
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            wbill fills in every field in these guides for you, generates the PDF, and sends it on
            WhatsApp — from your phone, in seconds.
          </p>
          <Link
            href="/#waitlist"
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
          >
            Get early access
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </main>
    </>
  );
}
