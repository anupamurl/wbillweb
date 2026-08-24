import { formatInr } from '@/lib/currency';

const items = [
  { name: 'AC gas top-up', qty: 1, rate: 800 },
  { name: 'Service visit', qty: 1, rate: 300 },
];

const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
const tax = Math.round(subtotal * 0.18);
const total = subtotal + tax;

export default function BillMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-border bg-surface p-1 shadow-xl">
      <div className="rounded-xl bg-background p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Sharma Electricals</p>
            <p className="text-xs text-text-secondary">Bill to: Amit Verma</p>
          </div>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Paid</span>
        </div>
        <div className="mt-4 space-y-2 border-y border-border py-4">
          {items.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {item.name} <span className="text-text-disabled">×{item.qty}</span>
              </span>
              <span className="text-text-primary">{formatInr(item.qty * item.rate)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatInr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>GST</span>
            <span>{formatInr(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-text-primary">
            <span>Total</span>
            <span>{formatInr(total)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white">
          Sent on WhatsApp
        </div>
      </div>
    </div>
  );
}
