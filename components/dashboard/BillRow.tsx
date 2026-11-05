import { formatPaise } from '@/lib/currency';
import { formatPhone } from '@/lib/phone';
import { formatBillNo, type Bill } from '@/lib/models';

export default function BillRow({ bill }: { bill: Bill }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{bill.customerName || formatPhone(bill.customerPhone)}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {formatBillNo(bill.billNumber)} · {bill.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatPaise(bill.grandTotal)}</p>
    </div>
  );
}
