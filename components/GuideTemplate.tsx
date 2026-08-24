import Link from 'next/link';
import type { InvoiceFormatGuide } from '@/content/types';
import Faq from './Faq';
import { formatInr } from '@/lib/currency';

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
      <nav className="text-sm text-text-secondary">
        <Link href="/invoice-format" className="hover:text-text-primary">Invoice formats</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-primary">{guide.audience}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{guide.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">{guide.intro}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">What this bill must include</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">
          {guide.mustInclude.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">A worked example</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-surface-variant px-5 py-3">
            <p className="font-semibold text-text-primary">{guide.example.businessName}</p>
            <p className="text-sm text-text-secondary">Bill to: {guide.example.customerName}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                  <th className="px-5 py-2 font-medium">Item</th>
                  <th className="px-5 py-2 text-right font-medium">Qty</th>
                  <th className="px-5 py-2 text-right font-medium">Rate</th>
                  <th className="px-5 py-2 text-right font-medium">GST</th>
                  <th className="px-5 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-2 text-text-primary">{row.name}</td>
                    <td className="px-5 py-2 text-right text-text-secondary">{row.quantity}</td>
                    <td className="px-5 py-2 text-right text-text-secondary">{formatInr(row.unitPrice)}</td>
                    <td className="px-5 py-2 text-right text-text-secondary">{row.taxRatePercent}%</td>
                    <td className="px-5 py-2 text-right text-text-primary">{formatInr(row.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-1 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST</span>
              <span>{formatInr(taxTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-text-primary">
              <span>Total</span>
              <span>{formatInr(grandTotal)}</span>
            </div>
          </div>
          {guide.example.notes && (
            <p className="border-t border-border px-5 py-3 text-xs text-text-secondary">{guide.example.notes}</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">On tax</h2>
        <p className="mt-4 text-text-secondary">{guide.taxNote}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Common mistakes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">
          {guide.commonMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-lg border border-border bg-surface-variant px-6 py-8 text-center">
        <h2 className="text-xl font-semibold text-text-primary">Or let wbill build this bill for you</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Every field above, filled in automatically, sent on WhatsApp in seconds.
        </p>
        <Link
          href="/#waitlist"
          className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Get early access
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">FAQ</h2>
        <div className="mt-4">
          <Faq items={guide.faq} />
        </div>
      </section>
    </main>
  );
}
