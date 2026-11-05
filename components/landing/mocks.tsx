import type { ReactNode } from 'react';
import WbillMark from '@/components/WbillMark';
import Icon, { type IconName } from '@/components/Icon';
import { DemoBadge } from './primitives';
import {
  demoBill,
  demoBusiness,
  demoCustomer,
  demoHistory,
  demoMonths,
  demoOverview,
  demoRecentBills,
  demoShareText,
  demoTopCustomers,
  demoWeek,
  inr,
} from '@/content/demo';

/*
 * Product mockups, drawn in HTML/CSS rather than screenshots so they stay
 * crisp at every size and load nothing extra. Each one reproduces a real
 * WBill screen — its labels are the app's own strings — filled with
 * clearly labelled demo data.
 */

/* ------------------------------------------------------------------ *
 * Frames
 * ------------------------------------------------------------------ */

export function PhoneFrame({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <figure className={`wb-phone ${className}`} aria-label={label}>
      <div className="wb-phone-screen aspect-[9/19.2]">
        <div className="wb-phone-notch" aria-hidden="true" />
        <StatusBar />
        <div className="absolute inset-x-0 bottom-0 top-9 flex flex-col">{children}</div>
      </div>
    </figure>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-[4] flex h-9 items-center justify-between px-6 text-[0.62em] font-semibold text-ink" aria-hidden="true">
      <span className="tabular">9:41</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-[1.5px]">
          {[3, 5, 7, 9].map((h) => (
            <span key={h} className="w-[2.5px] rounded-sm bg-current" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]">
          <span className="block h-full w-3/4 rounded-[1.5px] bg-current" />
        </span>
      </span>
    </div>
  );
}

export function BrowserFrame({ children, url, className = '' }: { children: ReactNode; url: string; className?: string }) {
  return (
    <figure className={`wb-browser ${className}`}>
      <div className="flex items-center gap-3 border-b border-line bg-canvas px-4 py-2.5" aria-hidden="true">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="mx-auto flex max-w-xs flex-1 items-center justify-center gap-1.5 rounded-md bg-surface px-3 py-1 font-mono text-[0.65em] text-ink-soft">
          <Icon name="key" className="h-3 w-3" />
          {url}
        </span>
        <span className="w-[42px]" />
      </div>
      {children}
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * App screens
 * ------------------------------------------------------------------ */

function AppBar({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 pb-2 pt-2">
      <Icon name="arrow" className="h-4 w-4 rotate-180 text-ink" />
      <p className="min-w-0 flex-1 truncate text-[0.82em] font-semibold text-ink">{title}</p>
      {trailing}
    </div>
  );
}

/** The bill detail screen in the WBill app, after "Save bill". */
export function AppBillScreen() {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <AppBar title={demoBill.number} trailing={<DemoBadge />} />
      <div className="mx-3 flex-1 overflow-hidden rounded-2xl border border-line bg-surface p-3.5">
        <p className="text-[0.8em] font-semibold text-ink">{demoBusiness.name}</p>
        <p className="text-[0.6em] text-ink-soft">{demoBusiness.place}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-y border-line py-2.5">
          <Labeled label="Bill no." value={demoBill.number} />
          <Labeled label="Date" value={demoBill.date} />
        </div>
        <div className="mt-2.5">
          <Labeled label="Billed to" value={`${demoCustomer.name}`} />
          <p className="text-[0.6em] text-ink-soft tabular">{demoCustomer.phone}</p>
        </div>
        <ul className="mt-3 space-y-2 border-t border-line pt-2.5">
          {demoBill.lines.map((line) => (
            <li key={line.name} className="flex items-baseline justify-between gap-2 text-[0.64em]">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{line.name}</span>
                <span className="text-ink-soft tabular">
                  {line.qty} × {inr(line.price)}
                </span>
              </span>
              <span className="font-medium text-ink tabular">{inr(line.qty * line.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2.5">
          <span className="text-[0.7em] font-semibold text-ink">Total</span>
          <span className="text-[0.95em] font-semibold text-ink tabular">{inr(demoBill.total, true)}</span>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <MockButton icon="chat">Share on WhatsApp</MockButton>
        <div className="grid grid-cols-2 gap-2">
          <MockButton variant="secondary" icon="phone">
            Message
          </MockButton>
          <MockButton variant="secondary" icon="document">
            PDF
          </MockButton>
        </div>
      </div>
    </div>
  );
}

/** One button style for every app mock, matching the site's primary/secondary buttons at phone scale. */
function MockButton({
  children,
  icon,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const tone = variant === 'primary' ? 'bg-primary text-white' : 'bg-surface text-ink ring-1 ring-inset ring-line-strong';
  return (
    <span className={`flex h-9 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[0.66em] font-semibold ${tone} ${className}`}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** The New bill form in the WBill app. */
export function NewBillScreen() {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <AppBar title="New bill" trailing={<DemoBadge />} />
      <div className="flex-1 space-y-3 overflow-hidden px-3">
        <div className="rounded-2xl border border-line bg-surface p-3">
          <p className="text-[0.6em] font-semibold uppercase tracking-[0.06em] text-ink-faint">Customer</p>
          <Field label="Customer mobile" value={demoCustomer.phone} />
          <Field label="Customer name (optional)" value={demoCustomer.name} />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-3">
          <p className="text-[0.6em] font-semibold uppercase tracking-[0.06em] text-ink-faint">Items</p>
          {demoBill.lines.map((line) => (
            <div key={line.name} className="mt-2 grid grid-cols-[1fr_2rem_3.4rem] gap-1.5 text-[0.6em]">
              <span className="truncate rounded-md border border-line px-1.5 py-1 text-ink">{line.name}</span>
              <span className="rounded-md border border-line px-1.5 py-1 text-center text-ink tabular">{line.qty}</span>
              <span className="rounded-md border border-line px-1.5 py-1 text-right text-ink tabular">{line.price}</span>
            </div>
          ))}
          <p className="mt-2 text-[0.6em] font-medium text-primary">+ Add item</p>
        </div>
      </div>
      <div className="mt-3 border-t border-line bg-surface p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.65em] text-ink-soft">Total</span>
          <span className="text-[0.95em] font-semibold text-ink tabular">{inr(demoBill.total, true)}</span>
        </div>
        <MockButton className="mt-2">Preview bill</MockButton>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 rounded-lg border border-line px-2 py-1.5">
      <p className="text-[0.5em] text-ink-faint">{label}</p>
      <p className="text-[0.66em] text-ink tabular">{value}</p>
    </div>
  );
}

function Labeled({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55em] uppercase tracking-[0.06em] text-ink-faint">{label}</p>
      <p className="text-[0.68em] font-medium text-ink tabular">{value}</p>
    </div>
  );
}

/** What the customer sees: the bill arrives in their chat as a PDF with the app's message. */
export function ChatScreen({ animate = false }: { animate?: boolean }) {
  const [line1, line2] = demoShareText(inr(demoBill.total, true));
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line bg-surface px-3.5 pb-2.5 pt-1.5">
        <Icon name="arrow" className="h-4 w-4 rotate-180 text-ink" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas-deep text-[0.6em] font-semibold text-ink">MS</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.72em] font-semibold text-ink">{demoBusiness.name}</span>
          <span className="block text-[0.55em] text-ink-soft">Chat</span>
        </span>
        <DemoBadge />
      </div>
      <div className="wb-chat-wall flex flex-1 flex-col justify-end gap-2 p-3">
        <span className="mx-auto rounded-md bg-surface/80 px-2 py-0.5 text-[0.55em] text-ink-soft">Today</span>
        <div className={`ml-auto w-[86%] rounded-xl rounded-tr-sm bg-chat-out p-1.5 shadow-sm ${animate ? 'wb-pop' : ''}`} style={animate ? ({ '--wb-delay': '300ms' } as React.CSSProperties) : undefined}>
          <div className="flex items-center gap-2 rounded-lg bg-black/[0.05] p-2">
            <span className="flex h-8 w-7 shrink-0 items-center justify-center rounded bg-error/90 font-mono text-[0.45em] font-bold text-white">PDF</span>
            <span className="min-w-0">
              <span className="block truncate text-[0.62em] font-medium text-ink">{demoBill.number}.pdf</span>
              <span className="block text-[0.52em] text-ink-soft">1 page · PDF</span>
            </span>
          </div>
          <p className="px-1 pb-0.5 pt-1.5 text-[0.62em] leading-snug text-ink">
            {line1}
            <br />
            {line2}
          </p>
          <p className="px-1 text-right text-[0.5em] text-ink-soft">
            {demoBill.time} <span className="text-primary">✓✓</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-surface px-3 py-2">
        <span className="h-7 flex-1 rounded-full bg-canvas" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white">
          <Icon name="arrow" className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

/** The generated PDF bill, as the customer opens it. */
export function InvoiceSheet({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 text-ink sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95em] font-semibold tracking-[-0.01em]">{demoBusiness.name}</p>
          <p className="text-[0.7em] text-ink-soft">{demoBusiness.place}</p>
        </div>
        <DemoBadge />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-3 text-[0.7em]">
        <div>
          <p className="text-ink-faint">Bill no.</p>
          <p className="mt-0.5 font-medium tabular">{demoBill.number}</p>
        </div>
        <div>
          <p className="text-ink-faint">Date</p>
          <p className="mt-0.5 font-medium tabular">{demoBill.date}</p>
        </div>
        <div>
          <p className="text-ink-faint">Billed to</p>
          <p className="mt-0.5 truncate font-medium">{demoCustomer.name}</p>
        </div>
      </div>
      <table className="mt-3 w-full text-[0.7em]">
        <thead>
          <tr className="text-left text-ink-faint">
            <th scope="col" className="py-1.5 font-normal">Item</th>
            <th scope="col" className="py-1.5 text-right font-normal">Qty</th>
            <th scope="col" className="py-1.5 text-right font-normal">Price</th>
            <th scope="col" className="py-1.5 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {demoBill.lines.map((line) => (
            <tr key={line.name} className="border-t border-line">
              <td className="py-2 pr-2 font-medium">{line.name}</td>
              <td className="py-2 text-right tabular text-ink-soft">{line.qty}</td>
              <td className="py-2 text-right tabular text-ink-soft">{inr(line.price)}</td>
              <td className="py-2 text-right font-medium tabular">{inr(line.qty * line.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-baseline justify-between border-t border-ink pt-3">
        <span className="text-[0.75em] font-semibold">Total</span>
        <span className="text-lg font-semibold tracking-[-0.02em] tabular">{inr(demoBill.total, true)}</span>
      </div>
      <p className="mt-5 text-center text-[0.68em] text-ink-soft">Thank you for your purchase!</p>
      <p className="mt-1 flex items-center justify-center gap-1.5 text-[0.6em] text-ink-faint">
        <WbillMark size={11} /> Made with WBill · wbill.app
      </p>
    </div>
  );
}

/** A thermal paper receipt: the thing WBill replaces. */
export function PaperReceipt({ faded = false, className = '' }: { faded?: boolean; className?: string }) {
  return (
    <div className={`wb-paper wb-tear px-5 pb-7 pt-8 font-mono text-[0.68em] leading-relaxed shadow-[0_24px_50px_-28px_rgb(43_41_36/0.45)] ${className}`}>
      <div className={`transition-[opacity,filter] duration-700 ${faded ? 'opacity-40 blur-[0.6px] [filter:sepia(0.6)]' : ''}`}>
        <p className="text-center font-semibold uppercase tracking-[0.12em]">{demoBusiness.name}</p>
        <p className="text-center opacity-70">{demoBusiness.place}</p>
        <p className="mt-3 border-y border-dashed border-current/40 py-1.5 opacity-80">
          No. 0142 &nbsp;·&nbsp; 03/11/26 &nbsp;·&nbsp; 18:42
        </p>
        <ul className="mt-2 space-y-1">
          {demoBill.lines.map((line) => (
            <li key={line.name} className="flex justify-between gap-3">
              <span className="truncate">
                {line.qty} {line.name.toUpperCase()}
              </span>
              <span className="tabular">{(line.qty * line.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-dashed border-current/40 pt-1.5 font-semibold">
          <span>TOTAL</span>
          <span className="tabular">{demoBill.total.toFixed(2)}</span>
        </p>
        <p className="mt-3 text-center opacity-60">THANK YOU · VISIT AGAIN</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Dashboard & records
 * ------------------------------------------------------------------ */

/** The WBill web dashboard's Overview page. */
export function DashboardScreen({ compact = false }: { compact?: boolean }) {
  const max = Math.max(...demoMonths.map((m) => m.revenue));
  return (
    <div className="flex bg-canvas text-ink">
      {!compact && (
        <aside className="hidden w-40 shrink-0 border-r border-line p-3 md:block" aria-hidden="true">
          <div className="flex items-center gap-2 px-1.5 pb-4">
            <WbillMark size={18} />
            <span className="text-[0.72em] font-semibold">WBill</span>
          </div>
          {['Overview', 'Bills', 'Customers', 'Insights', 'Profile'].map((item, index) => (
            <p
              key={item}
              className={`rounded-lg px-2 py-1.5 text-[0.68em] ${index === 0 ? 'bg-primary/10 font-medium text-primary' : 'text-ink-soft'}`}
            >
              {item}
            </p>
          ))}
        </aside>
      )}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.95em] font-semibold tracking-[-0.02em]">{demoBusiness.name}</p>
            <p className="text-[0.65em] text-ink-soft">Your business, at a glance.</p>
          </div>
          <div className="flex items-center gap-2">
            <DemoBadge />
            <span className="rounded-full bg-primary px-2.5 py-1 text-[0.62em] font-semibold text-white">+ New bill</span>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat label="Total bills" value={String(demoOverview.bills)} />
          <Stat label="Total customers" value={String(demoOverview.customers)} />
          <Stat label="Total revenue" value={inr(demoOverview.revenue)} />
          <Stat label="Bills this month" value={String(demoOverview.billsThisMonth)} hint={inr(demoOverview.revenueThisMonth)} />
        </dl>
        <div className="mt-3 grid gap-2 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-[0.62em] text-ink-soft">Revenue, last 6 months</p>
            <div className="mt-3 flex h-24 items-end gap-2" aria-hidden="true">
              {demoMonths.map((month, index) => (
                <div key={month.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className={`wb-grow w-full rounded-t-md ${index === demoMonths.length - 2 ? 'bg-primary' : 'bg-primary/25'}`}
                    style={{ height: `${(month.revenue / max) * 80}%`, '--wb-delay': `${index * 70}ms` } as React.CSSProperties}
                  />
                  <span className="text-[0.55em] text-ink-faint">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface">
            <p className="border-b border-line px-3 py-2 text-[0.65em] font-semibold">Recent bills</p>
            <ul className="divide-y divide-line">
              {demoRecentBills.slice(0, compact ? 3 : 4).map((bill) => (
                <li key={bill.number} className="flex items-center justify-between gap-2 px-3 py-1.5 text-[0.62em]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{bill.customer}</span>
                    <span className="font-mono text-[0.55em] text-ink-faint">{bill.number}</span>
                  </span>
                  <span className="font-medium tabular">{inr(bill.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-2.5">
      <dt className="text-[0.58em] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-[0.95em] font-semibold tracking-[-0.02em] tabular">{value}</dd>
      {hint && <dd className="text-[0.55em] text-ink-faint tabular">{hint}</dd>}
    </div>
  );
}

/** One customer's purchase history, as the business sees it. */
export function CustomerHistory({ className = '' }: { className?: string }) {
  const total = demoHistory.reduce((sum, bill) => sum + bill.total, 0);
  return (
    <div className={`rounded-2xl border border-line bg-surface ${className}`}>
      <div className="flex items-center gap-3 border-b border-line p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas-deep text-xs font-semibold text-ink">PS</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{demoCustomer.name}</p>
          <p className="text-xs text-ink-soft tabular">{demoCustomer.phone}</p>
        </div>
        <DemoBadge />
      </div>
      <dl className="grid grid-cols-2 divide-x divide-line border-b border-line text-center">
        <div className="p-3">
          <dt className="text-[0.65em] text-ink-soft">Bills</dt>
          <dd className="mt-0.5 text-base font-semibold tabular text-ink">{demoHistory.length}</dd>
        </div>
        <div className="p-3">
          <dt className="text-[0.65em] text-ink-soft">Total spent</dt>
          <dd className="mt-0.5 text-base font-semibold tabular text-ink">{inr(total)}</dd>
        </div>
      </dl>
      <ol className="relative p-4">
        <span className="absolute bottom-6 left-[1.6rem] top-6 w-px bg-line" aria-hidden="true" />
        {demoHistory.map((bill, index) => (
          <li key={bill.number} className="relative flex items-center gap-3 py-2">
            <span className={`relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full border-2 ${index === 0 ? 'border-primary bg-primary' : 'border-line-strong bg-surface'}`} style={{ marginLeft: '0.32rem' }} />
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8em] font-medium text-ink">{bill.date}</span>
              <span className="font-mono text-[0.65em] text-ink-faint">
                {bill.number} · {bill.items} {bill.items === 1 ? 'item' : 'items'}
              </span>
            </span>
            <span className="text-[0.8em] font-medium tabular text-ink">{inr(bill.total)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The Insights page: revenue trend, busiest days, top customers. */
export function InsightsScreen({ compact = false }: { compact?: boolean }) {
  const maxMonth = Math.max(...demoMonths.map((m) => m.revenue));
  const maxDay = Math.max(...demoWeek.map((d) => d.bills));
  const maxTop = Math.max(...demoTopCustomers.map((c) => c.spent));
  const points = demoMonths.map((m, i) => `${(i / (demoMonths.length - 1)) * 100},${100 - (m.revenue / maxMonth) * 88}`).join(' ');

  return (
    <div className={`grid gap-3 bg-canvas p-4 text-ink sm:p-5 ${compact ? '' : 'lg:grid-cols-[1.4fr_1fr]'}`}>
      <div className={`rounded-xl border border-line bg-surface p-4 ${compact ? '' : 'lg:row-span-2'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">Revenue, last 6 months</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] tabular">{inr(demoMonths.reduce((s, m) => s + m.revenue, 0))}</p>
          </div>
          <DemoBadge />
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-5 h-40 w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={compact ? "wb-area-c" : "wb-area"} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--wbill-primary)" stopOpacity="0.18" />
              <stop offset="1" stopColor="var(--wbill-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--wb-line)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          ))}
          <polygon points={`0,100 ${points} 100,100`} fill={compact ? "url(#wb-area-c)" : "url(#wb-area)"} />
          <polyline points={points} fill="none" stroke="var(--wbill-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="mt-2 flex justify-between text-[0.65em] text-ink-faint">
          {demoMonths.map((m) => (
            <span key={m.label}>{m.label}</span>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border border-line bg-surface p-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-xs text-ink-soft">Bills by day, last 7 days</p>
        <div className="mt-4 flex h-20 items-end gap-1.5" aria-hidden="true">
          {demoWeek.map((day, index) => (
            <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className={`wb-grow w-full rounded-t ${day.bills === maxDay ? 'bg-ink' : 'bg-ink/15'}`}
                style={{ height: `${(day.bills / maxDay) * 76}%`, '--wb-delay': `${index * 60}ms` } as React.CSSProperties}
              />
              <span className="text-[0.55em] text-ink-faint">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-xs text-ink-soft">Top customers</p>
        <ul className="mt-3 space-y-2.5">
          {demoTopCustomers.map((c, index) => (
            <li key={c.name} className="text-[0.7em]">
              <div className="flex justify-between gap-2">
                <span className="truncate font-medium">{c.name}</span>
                <span className="tabular text-ink-soft">{inr(c.spent)}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-canvas-deep">
                <div className="wb-growx h-full rounded-full bg-primary" style={{ width: `${(c.spent / maxTop) * 100}%`, '--wb-delay': `${index * 80}ms` } as React.CSSProperties} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
