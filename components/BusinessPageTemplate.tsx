import Link from 'next/link';
import type { Business, BusinessPage } from '@/content/businesses';
import { businesses, businessHref } from '@/content/businesses';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import Faq from './Faq';
import Icon from './Icon';
import WbillMark from './WbillMark';
import { DemoBadge } from './landing/primitives';

function SampleBill({ bill }: { bill: BusinessPage['sampleBill'] }) {
  const rows = bill.lines.map((line) => ({ ...line, amount: line.qty * line.rate }));
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);
  const total = subtotal - (bill.discount ?? 0);

  return (
    <div className="wb-shadow rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <WbillMark size={32} />
          <div>
            <p className="font-semibold text-ink">{bill.businessName}</p>
            <p className="text-xs text-ink-soft">{bill.place}</p>
          </div>
        </div>
        <DemoBadge />
      </div>
      <p className="mt-4 rounded-lg bg-canvas px-3.5 py-2 text-sm text-ink">
        Bill to <span className="font-medium">{bill.customerName}</span>
      </p>

      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">Sample bill from {bill.businessName}</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs text-ink-soft">
            <th scope="col" className="pb-2 font-medium">Item / work</th>
            <th scope="col" className="pb-2 text-right font-medium">Qty × Rate</th>
            <th scope="col" className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/70 align-top">
              <td className="py-2.5 pr-3">
                <p className="text-ink">
                  {row.name}
                  {row.kind === 'service' && (
                    <span className="ml-1.5 rounded bg-violet/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-violet">
                      Service
                    </span>
                  )}
                </p>
                {row.detail && row.detail !== 'Service' && row.detail !== 'Labour' && (
                  <p className="text-xs text-ink-soft">{row.detail}</p>
                )}
              </td>
              <td className="whitespace-nowrap py-2.5 text-right tabular-nums text-ink-soft">
                {row.qty} × {formatInr(row.rate)}
              </td>
              <td className="py-2.5 pl-3 text-right tabular-nums text-ink">{formatInr(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-4 max-w-[16rem] space-y-1.5 text-sm">
        {bill.discount ? (
          <>
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>Discount</dt>
              <dd className="tabular-nums">−{formatInr(bill.discount)}</dd>
            </div>
          </>
        ) : null}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-ink">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatInr(total)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-xs">
          <dt className="text-ink-soft">Status</dt>
          <dd
            className={`rounded-full px-2 py-0.5 font-semibold ${
              bill.status === 'Paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
            }`}
          >
            {bill.status}
          </dd>
        </div>
      </dl>
      {bill.note && <p className="mt-4 rounded-lg bg-canvas px-3.5 py-2.5 text-xs text-ink-soft">Note: {bill.note}</p>}
      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-ink">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
          <Icon name="chat" className="h-3 w-3" />
        </span>
        Sent as a PDF on WhatsApp. No GST on this sample — add it only if you&rsquo;re registered.
      </p>
    </div>
  );
}

export default function BusinessPageTemplate({ business }: { business: Business & { page: BusinessPage } }) {
  const { page } = business;
  const guide = business.guideSlug
    ? invoiceFormatGuides.find((candidate) => candidate.slug === business.guideSlug)
    : undefined;
  const others = businesses.filter((other) => other.slug !== business.slug);

  return (
    <main>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
              <Link href="/" className="hover:text-ink">wbill</Link>
              <span className="mx-2 text-text-disabled">/</span>
              <Link href="/#industries" className="hover:text-ink">Who it&rsquo;s for</Link>
              <span className="mx-2 text-text-disabled">/</span>
              <span className="text-ink">{business.label}</span>
            </nav>
            <p className="wb-in mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Icon name={business.icon} className="h-4 w-4" />
              wbill - Digital Billing App
            </p>
            <h1 className="wb-in mt-3 text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl" style={delay(60)}>
              {page.h1}
            </h1>
            <p className="wb-in mt-4 text-lg font-medium text-ink" style={delay(100)} lang="hi-Latn">
              {page.hinglish}
            </p>
            <p className="wb-in mt-5 text-lg leading-relaxed text-ink-soft" style={delay(140)}>
              {page.intro}
            </p>
            <div className="wb-in mt-8 flex flex-col items-start gap-3" style={delay(200)}>
              <a
                href="/login"
                className="wb-cta wb-btn wb-btn-lg group bg-primary text-white"
              >
                Get started free
                <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
              <p className="text-xs text-ink-soft">Free to get started. Android and iOS app coming soon.</p>
            </div>
          </div>
          <div className="wb-in-rise" style={delay(260)}>
            <SampleBill bill={page.sampleBill} />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
            What a {business.label.toLowerCase()} bill needs — and how wbill does it
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {page.billNeeds.map((need, index) => (
              <li
                key={need.title}
                className="wb-reveal rounded-2xl border border-border bg-surface p-6"
                style={delay((index % 2) * 60)}
              >
                <p className="font-semibold text-ink">{need.title}</p>
                <p className="mt-2 leading-relaxed text-ink-soft">{need.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Questions {business.label.toLowerCase()} owners ask</h2>
            <div className="mt-6">
              <Faq items={page.faq} />
            </div>
          </div>
          <aside className="space-y-4">
            {guide && (
              <Link
                href={`/invoice-format/${guide.slug}/`}
                className="wb-card group block rounded-2xl border border-border bg-surface p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Free guide</p>
                <p className="mt-2 font-semibold text-ink">{guide.title}</p>
                <p className="mt-1.5 text-sm text-ink-soft">{guide.description}</p>
              </Link>
            )}
            <Link
              href="/invoice-format/simple-bill-format/"
              className="wb-card group block rounded-2xl border border-border bg-surface p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Free guide</p>
              <p className="mt-2 font-semibold text-ink">Simple bill format without GST</p>
              <p className="mt-1.5 text-sm text-ink-soft">For any shop or service that is not GST-registered.</p>
            </Link>
          </aside>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">wbill is also for</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={businessHref(other)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon name={other.icon} className="h-4 w-4" />
                  {other.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
