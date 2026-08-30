import Link from 'next/link';
import type { InvoiceFormatGuide } from '@/content/types';
import Faq from './Faq';
import Icon from './Icon';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';

function computeTotals(guide: InvoiceFormatGuide) {
  const rows = guide.example.items.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    const taxAmount = (lineTotal * item.taxRatePercent) / 100;
    return { ...item, lineTotal, taxAmount };
  });
  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
  const taxTotal = rows.reduce((sum, row) => sum + row.taxAmount, 0);
  return { rows, subtotal, taxTotal, grandTotal: subtotal + taxTotal };
}

export default function GuideTemplate({ guide }: { guide: InvoiceFormatGuide }) {
  const { rows, subtotal, taxTotal, grandTotal } = computeTotals(guide);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/invoice-format" className="transition-colors hover:text-text-primary">
          Invoice formats
        </Link>
        <span className="mx-2 text-text-disabled">/</span>
        <span className="text-text-primary">{guide.title}</span>
      </nav>

      <p className="wb-in mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {guide.audience}
      </p>
      <h1
        className="wb-in mt-3 text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl"
        style={delay(60)}
      >
        {guide.title}
      </h1>
      <p className="wb-in mt-5 text-lg leading-relaxed text-text-secondary" style={delay(120)}>
        {guide.intro}
      </p>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          What this bill must include
        </h2>
        <ul className="mt-5 space-y-3">
          {guide.mustInclude.map((item) => (
            <li key={item} className="flex items-start gap-3 text-text-secondary">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Icon name="check" className="h-3 w-3" />
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          A worked example
        </h2>
        <div className="wb-elevated mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border bg-surface-variant/70 px-5 py-4">
            <p className="font-semibold text-text-primary">{guide.example.businessName}</p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Bill to: {guide.example.customerName}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-secondary">
                  <th scope="col" className="px-5 py-3 font-semibold">Item</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Qty</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Rate</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">GST</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-text-primary">{row.name}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-secondary">{row.quantity}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-secondary">{formatInr(row.unitPrice)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-secondary">{row.taxRatePercent}%</td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-primary">{formatInr(row.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-1.5 border-t border-border bg-surface-variant/40 px-5 py-4 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST</span>
              <span className="tabular-nums">{formatInr(taxTotal)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold text-text-primary">
              <span>Total</span>
              <span className="tabular-nums">{formatInr(grandTotal)}</span>
            </div>
          </div>
          {guide.example.notes && (
            <p className="border-t border-border px-5 py-3.5 text-xs leading-relaxed text-text-secondary">
              {guide.example.notes}
            </p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">On tax</h2>
        <p className="mt-4 leading-relaxed text-text-secondary">{guide.taxNote}</p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          Common mistakes
        </h2>
        <ul className="mt-5 space-y-3">
          {guide.commonMistakes.map((mistake) => (
            <li key={mistake} className="flex items-start gap-3 text-text-secondary">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error/15 text-error">
                <Icon name="cross" className="h-3 w-3" />
              </span>
              <span className="leading-relaxed">{mistake}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative isolate mt-16 overflow-hidden rounded-2xl border border-primary/25 bg-surface-variant/60 px-6 py-10 text-center sm:px-10">
        <div className="wb-aurora" aria-hidden="true">
          <div className="wb-blob left-[10%] top-[-60%] h-64 w-64 bg-primary/20" />
        </div>
        <div className="relative">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary sm:text-2xl">
            Or let wbill build this bill for you
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-text-secondary">
            Every field above, filled in automatically, totalled correctly, and sent on WhatsApp in
            seconds — from your phone.
          </p>
          <Link
            href="/#waitlist"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25"
          >
            Get early access
            <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          Questions people ask
        </h2>
        <div className="mt-5">
          <Faq items={guide.faq} />
        </div>
      </section>

      <p className="mt-14 text-sm text-text-secondary">
        More formats in the{' '}
        <Link href="/invoice-format" className="font-medium text-primary hover:underline">
          bill format guides
        </Link>
        .
      </p>
    </main>
  );
}
