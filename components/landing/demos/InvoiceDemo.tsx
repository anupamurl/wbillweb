import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import Icon from '@/components/Icon';
import WbillMark from '@/components/WbillMark';
import { demoCustomer, demoInvoice, demoInvoiceDate, demoInvoiceNumber, demoShop } from '@/content/demo';

/** A simple mixed bill (items + labour, no GST), plus the WhatsApp hand-off it ends in. */
export default function InvoiceDemo() {
  const { rows, subtotal, discount, tax, total } = demoInvoice;
  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8 lg:p-8">
      {/* The bill */}
      <div className="wb-stagger rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <WbillMark size={34} />
            <div>
              <p className="font-semibold text-ink">{demoShop.name}</p>
              <p className="text-xs text-ink-soft">{demoShop.area}</p>
              {demoShop.gstin && <p className="mt-0.5 text-xs text-ink-soft">GSTIN {demoShop.gstin}</p>}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-ink-soft">{tax > 0 ? 'Tax invoice' : 'Bill'}</p>
            <p className="text-sm font-semibold tabular-nums text-ink">{demoInvoiceNumber}</p>
            <p className="text-xs text-ink-soft">{demoInvoiceDate}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-lg bg-canvas px-3.5 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            RK
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Bill to {demoCustomer.name}</p>
            <p className="text-xs text-ink-soft">{demoCustomer.phone}</p>
          </div>
        </div>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-ink-soft">
              <th scope="col" className="pb-2 font-medium">Item</th>
              <th scope="col" className="hidden pb-2 text-right font-medium sm:table-cell">Qty × Rate</th>
              <th scope="col" className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-border/70 align-top">
                <td className="py-2.5 pr-3">
                  <p className="text-ink">{row.name}</p>
                  <p className="text-xs text-ink-soft sm:hidden">{row.detail}</p>
                </td>
                <td className="hidden py-2.5 text-right tabular-nums text-ink-soft sm:table-cell">
                  {row.qty} × {formatInr(row.rate)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-ink">{formatInr(row.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 ml-auto max-w-[16rem] space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatInr(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-ink-soft">
              <dt>Discount</dt>
              <dd className="tabular-nums">−{formatInr(discount)}</dd>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-ink-soft">
              <dt>GST</dt>
              <dd className="tabular-nums">{formatInr(tax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatInr(total)}</dd>
          </div>
          <div className="flex justify-between pt-1 text-xs">
            <dt className="text-ink-soft">Status</dt>
            <dd className="rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">Paid</dd>
          </div>
        </dl>
      </div>

      {/* WhatsApp hand-off */}
      <div className="flex flex-col justify-center">
        <div className="mx-auto w-full max-w-[17rem] rounded-[1.75rem] border border-border bg-canvas p-2 shadow-sm">
          <div className="overflow-hidden rounded-[1.35rem] bg-surface">
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-xs font-semibold text-success">
                RK
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{demoCustomer.name}</p>
                <p className="text-[0.7rem] text-ink-soft">on WhatsApp</p>
              </div>
            </div>
            <div className="space-y-2 bg-canvas/60 px-3 py-4">
              <div className="wb-pop ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-chat p-2.5 text-ink" style={delay(250)}>
                <div className="flex items-center gap-2.5 rounded-lg bg-surface/70 p-2">
                  <span className="flex h-9 w-8 items-center justify-center rounded bg-error/15 text-[0.6rem] font-bold text-error">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{demoInvoiceNumber}.pdf</p>
                    <p className="text-[0.65rem] text-ink-soft">1 page</p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed">
                  Thank you! Your bill of {formatInr(total)} from {demoShop.name} is attached.
                </p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-ink-soft">
                  6:42 pm <Icon name="check" className="h-3 w-3 text-primary" />
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
            <Icon name="chat" className="h-3.5 w-3.5" />
          </span>
          Shared on WhatsApp from the app
        </p>
      </div>
    </div>
  );
}
