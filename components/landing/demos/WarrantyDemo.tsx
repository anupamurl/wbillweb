import { delay } from '@/lib/motion';
import Icon from '@/components/Icon';
import { demoWarranties, formatDate, warrantyState, demoToday } from '@/content/demo';

const statusCopy = {
  active: { label: 'Active', tone: 'bg-success/12 text-success', bar: 'bg-success' },
  expiring: { label: 'Expiring soon', tone: 'bg-warning/15 text-warning', bar: 'bg-warning' },
  expired: { label: 'Expired', tone: 'bg-ink-soft/12 text-ink-soft', bar: 'bg-ink-soft/50' },
} as const;

function remaining(daysLeft: number) {
  if (daysLeft < 0) return `Ended ${Math.abs(daysLeft)} days ago`;
  if (daysLeft < 60) return `${daysLeft} days left`;
  return `${Math.round(daysLeft / 30.4)} months left`;
}

export default function WarrantyDemo() {
  const [featured, ...others] = demoWarranties;
  const f = warrantyState(featured.purchased, featured.months);
  const fs = statusCopy[f.status];

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:p-8">
      <div className="wb-stagger rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-ink-soft">Product</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-ink">{featured.product}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${fs.tone}`}>{fs.label}</span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
          {[
            ['Serial number', featured.serial],
            ['Purchase date', formatDate(f.start)],
            ['Warranty', `${featured.months} months`],
            ['Valid until', formatDate(f.end)],
          ].map(([term, value]) => (
            <div key={term} className="bg-surface px-3.5 py-3">
              <dt className="text-xs text-ink-soft">{term}</dt>
              <dd className="mt-0.5 truncate font-medium tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-ink-soft">
            <span>{formatDate(f.start)}</span>
            <span className="font-medium text-ink">{remaining(f.daysLeft)}</span>
            <span>{formatDate(f.end)}</span>
          </div>
          <div className="relative mt-2 h-2.5 rounded-full bg-canvas">
            <div
              className={`wb-barx absolute inset-y-0 left-0 rounded-full ${fs.bar}`}
              style={{ width: `${f.progress * 100}%`, ...delay(150) }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow"
              style={{ left: `${f.progress * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-ink-soft">Today, {formatDate(demoToday)}</p>
        </div>
      </div>

      <div className="wb-stagger space-y-3">
        <p className="text-sm font-medium text-ink">Other purchases by this customer</p>
        {others.map((item) => {
          const s = warrantyState(item.purchased, item.months);
          const c = statusCopy[s.status];
          return (
            <div key={item.serial} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-ink">{item.product}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${c.tone}`}>
                  {c.label}
                </span>
              </div>
              <p className="mt-1 text-xs tabular-nums text-ink-soft">{item.serial}</p>
              <div className="mt-3 h-1.5 rounded-full bg-canvas">
                <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${s.progress * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">{remaining(s.daysLeft)}</p>
            </div>
          );
        })}
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-xs leading-relaxed text-ink">
          <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          The refrigerator&rsquo;s warranty ends within 60 days, a good moment to offer an extended plan.
        </div>
      </div>
    </div>
  );
}
