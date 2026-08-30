import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import Icon from './Icon';
import WbillMark from './WbillMark';

/**
 * The hero's centre of gravity: a phone showing a real bill, with the
 * amounts computed the way the app computes them — tax per line item,
 * not a flat rate on the subtotal.
 */
const items = [
  { name: 'AC gas top-up', qty: 1, rate: 800, taxRatePercent: 18 },
  { name: 'Service visit', qty: 1, rate: 300, taxRatePercent: 18 },
];

const rows = items.map((item) => {
  const lineTotal = item.qty * item.rate;
  return { ...item, lineTotal, taxAmount: (lineTotal * item.taxRatePercent) / 100 };
});

const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
const taxTotal = rows.reduce((sum, row) => sum + row.taxAmount, 0);
const total = subtotal + taxTotal;

export default function BillMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[21rem]">
      {/* Glow pooled behind the device. */}
      <div
        className="absolute -inset-8 rounded-[3.5rem] bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="wb-in-rise relative" style={delay(200)}>
        <div className="wb-elevated relative rounded-[2.6rem] border border-border bg-surface p-2.5">
          <div className="relative overflow-hidden rounded-[2.1rem] bg-background">
            {/* Notch */}
            <div className="flex justify-center pt-3">
              <span className="h-1.5 w-16 rounded-full bg-border" aria-hidden="true" />
            </div>

            {/* App bar */}
            <div className="flex items-center justify-between px-5 pb-4 pt-4">
              <div className="flex items-center gap-2">
                <WbillMark size={22} />
                <span className="text-sm font-semibold tracking-tight text-text-primary">wbill</span>
              </div>
              <span className="rounded-md bg-surface-variant px-2 py-1 text-[0.65rem] font-medium tracking-wide text-text-secondary">
                INV-2026-0148
              </span>
            </div>

            {/* Bill */}
            <div className="mx-3 mb-3 rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Sharma Electricals</p>
                  <p className="mt-0.5 text-xs text-text-secondary">Bill to: Amit Verma</p>
                </div>
                <span className="wb-in-fade shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-[0.7rem] font-semibold text-success" style={delay(1400)}>
                  Paid
                </span>
              </div>

              <div className="mt-4 space-y-2.5 border-y border-border py-4">
                {rows.map((row, index) => (
                  <div
                    key={row.name}
                    className="wb-in flex items-baseline justify-between gap-3 text-sm"
                    style={delay(500 + index * 130)}
                  >
                    <span className="text-text-secondary">
                      {row.name}{' '}
                      <span className="text-text-disabled">
                        ×{row.qty} · {row.taxRatePercent}%
                      </span>
                    </span>
                    <span className="tabular-nums text-text-primary">{formatInr(row.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>GST</span>
                  <span className="tabular-nums">{formatInr(taxTotal)}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-semibold text-text-primary">
                  <span>Total</span>
                  <span className="tabular-nums">{formatInr(total)}</span>
                </div>
              </div>

              {/* Send action — the sheen and the fill bar carry the "in seconds" claim. */}
              <div className="wb-sheen mt-5 rounded-xl bg-primary px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <Icon name="chat" className="h-4 w-4" />
                  Sending on WhatsApp
                </div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/25">
                  <div className="wb-progress h-full rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating status cards. Decorative — the bill above already says all of
            this. Both sit outside the screen area so they never cover a line of
            the bill itself. */}
        <div
          className="wb-float absolute -right-6 -top-5 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-lg sm:flex"
          style={delay(0)}
          aria-hidden="true"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="document" className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium text-text-primary">PDF ready</span>
        </div>

        <div
          className="wb-float absolute -bottom-6 -left-6 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-lg sm:flex"
          style={delay(1600)}
          aria-hidden="true"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15 text-success">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium text-text-primary">
            {formatInr(total)} marked paid
          </span>
        </div>
      </div>
    </div>
  );
}
