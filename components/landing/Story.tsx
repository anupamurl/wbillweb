import type { ReactNode } from 'react';
import { formatInr } from '@/lib/currency';
import { delay } from '@/lib/motion';
import Icon from '@/components/Icon';
import CountUp from './CountUp';
import { DemoBadge, SectionIntro, StatusTag, subHeading, type Availability } from './primitives';
import {
  demoCustomer,
  demoInvoice,
  demoInvoiceNumber,
  demoKpis,
  demoRevenue,
  demoShop,
  demoWarranties,
  formatDate,
  warrantyState,
} from '@/content/demo';

/* ---------- Chapter visuals ---------- */

function PaperToPhone() {
  const { rows, total } = demoInvoice;
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md">
      {/* The paper slip. */}
      <div className="wb-story-paper absolute left-[4%] top-[12%] w-56 -rotate-3 sm:left-[2%] sm:w-60">
        <div className="wb-tear bg-paper px-5 py-6 text-paper-ink shadow-[0_18px_40px_-18px_rgb(43_42_39/0.45)] [font-family:ui-monospace,Menlo,monospace]">
          <p className="text-center text-[0.8rem] font-bold">{demoShop.name.toUpperCase()}</p>
          <p className="text-center text-[0.65rem] opacity-70">Cash memo</p>
          <div className="my-3 border-t border-dashed border-paper-ink/40" />
          {rows.map((row) => (
            <p key={row.name} className="flex justify-between gap-2 text-[0.65rem] leading-5">
              <span className="truncate">{row.name.split(' ').slice(0, 2).join(' ')}</span>
              <span>{row.lineTotal}</span>
            </p>
          ))}
          <div className="my-3 border-t border-dashed border-paper-ink/40" />
          <p className="flex justify-between text-[0.75rem] font-bold">
            <span>TOTAL</span>
            <span>{total}</span>
          </p>
          <p className="mt-4 text-center text-[0.6rem] italic opacity-50">ink fading…</p>
        </div>
      </div>

      {/* The digital receipt. */}
      <div className="wb-story-phone absolute right-[4%] top-0 w-56 sm:right-[2%] sm:w-60">
        <div className="wb-shadow rounded-[2.2rem] border border-border bg-surface p-2">
          <div className="overflow-hidden rounded-[1.8rem] bg-canvas">
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="h-1.5 w-14 rounded-full bg-border" aria-hidden="true" />
              <DemoBadge />
            </div>
            <div className="p-4 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink">{demoShop.name}</p>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.6rem] font-semibold text-success">Saved</span>
              </div>
              <p className="mt-0.5 text-[0.65rem] text-ink-soft">{demoInvoiceNumber}</p>
              <div className="mt-3 space-y-1.5 rounded-xl bg-surface p-3">
                {rows.map((row) => (
                  <p key={row.name} className="flex justify-between gap-2 text-[0.68rem]">
                    <span className="truncate text-ink-soft">{row.name}</span>
                    <span className="tabular-nums text-ink">{formatInr(row.lineTotal)}</span>
                  </p>
                ))}
                <p className="flex justify-between border-t border-border pt-1.5 text-xs font-semibold text-ink">
                  <span>Total incl. GST</span>
                  <span className="tabular-nums">{formatInr(total)}</span>
                </p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-[0.7rem] font-semibold text-white">
                <Icon name="document" className="h-3.5 w-3.5" /> PDF on WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseSearch() {
  const results = [
    { item: '1.5 Ton inverter split AC', date: '3 Nov 2026', amount: demoInvoice.total },
    { item: 'Bluetooth soundbar', date: '14 Aug 2026', amount: 8259 },
    { item: 'Smartphone, 128 GB', date: '22 Jan 2026', amount: 21999 },
    { item: '55-inch 4K smart TV', date: '12 Mar 2026', amount: 46990 },
  ];
  return (
    <div className="wb-shadow mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Bills</p>
        <DemoBadge />
      </div>
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-primary/40 bg-canvas px-3.5 py-2.5 ring-4 ring-primary/10">
        <Icon name="hash" className="h-4 w-4 text-ink-soft" />
        <span className="text-sm text-ink">
          <span className="wb-story-type" style={{ ['--wb-type-w' as string]: '4ch' }}>Riya</span>
          <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-primary" />
        </span>
      </div>
      <p className="mt-4 text-xs text-ink-soft">4 bills for {demoCustomer.name}</p>
      <ul className="mt-2 divide-y divide-border">
        {results.map((r, i) => (
          <li key={r.item} className="wb-reveal flex items-center justify-between gap-3 py-3" style={delay(i * 70)}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="receipt" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-ink">{r.item}</p>
                <p className="text-xs text-ink-soft">{r.date}</p>
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums text-ink">{formatInr(r.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WarrantyTimeline() {
  const item = demoWarranties[0];
  const s = warrantyState(item.purchased, item.months);
  const stops = [
    { label: 'Purchased', date: formatDate(s.start), at: 0 },
    { label: 'Today', date: '3 Nov 2026', at: s.progress },
    { label: 'Warranty ends', date: formatDate(s.end), at: 1 },
  ];
  return (
    <div className="wb-shadow mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">{item.product}</p>
          <p className="mt-0.5 text-xs tabular-nums text-ink-soft">{item.serial}</p>
        </div>
        <DemoBadge />
      </div>
      <div className="relative mt-10 mb-16 h-1.5 rounded-full bg-canvas">
        <div
          className="wb-story-line absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${s.progress * 100}%` }}
        />
        {stops.map((stop) => (
          <div key={stop.label} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${stop.at * 100}%` }}>
            <span
              className={`block h-4 w-4 rounded-full border-[3px] border-surface shadow ${
                stop.label === 'Today' ? 'bg-primary ring-4 ring-primary/20' : 'bg-ink'
              }`}
            />
            <span
              className={`absolute top-6 whitespace-nowrap text-[0.7rem] ${
                stop.at === 0 ? 'left-0' : stop.at === 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              }`}
            >
              <span className="block font-medium text-ink">{stop.label}</span>
              <span className="block text-ink-soft">{stop.date}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['24 months', 'cover'],
          ['16 months', 'remaining'],
          ['1', 'service visit'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl bg-canvas px-2 py-3">
            <p className="text-sm font-semibold text-ink">{value}</p>
            <p className="text-[0.7rem] text-ink-soft">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveDashboard() {
  const max = Math.max(...demoRevenue.map((d) => d.value));
  return (
    <div className="wb-shadow mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">This month</p>
        <DemoBadge />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-canvas p-3.5">
          <p className="text-xs text-ink-soft">Revenue</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
            <CountUp value={demoKpis.revenue} kind="inr" />
          </p>
        </div>
        <div className="rounded-xl bg-canvas p-3.5">
          <p className="text-xs text-ink-soft">Bills issued</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
            <CountUp value={demoKpis.bills} />
          </p>
        </div>
      </div>
      <div className="mt-5 flex h-32 items-end gap-1.5" aria-hidden="true">
        {demoRevenue.map((d, i) => (
          <span
            key={d.label}
            className={`wb-story-bar block flex-1 rounded-t-md ${i === demoRevenue.length - 2 ? 'bg-primary' : 'bg-primary/25'}`}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-soft">Best month: October, led by split ACs before Diwali.</p>
    </div>
  );
}

/* ---------- Chapters ---------- */

type Chapter = {
  title: string;
  body: string;
  status: Availability;
  visual: ReactNode;
};

const chapters: Chapter[] = [
  {
    title: 'The paper bill is becoming a thing of the past.',
    body:
      'Thermal slips fade in a drawer and handwritten memos get lost. A WBill receipt is generated once, stored safely and lands on your customer’s phone over WhatsApp.',
    status: 'ready',
    visual: <PaperToPhone />,
  },
  {
    title: 'Never lose a purchase record again.',
    body:
      'A customer walks in asking for last year’s bill. Type their name and every bill you have issued them is there, in seconds, with the PDF one tap away.',
    status: 'ready',
    visual: <PurchaseSearch />,
  },
  {
    title: 'Warranty information, always accessible.',
    body:
      'Serial number, purchase date and cover period, kept with the bill. When a claim comes in, you know at a glance whether it is still covered.',
    status: 'planned',
    visual: <WarrantyTimeline />,
  },
  {
    title: 'Your retail business, understood better.',
    body:
      'See what you sold, how much is outstanding and which months carry the year. Every number comes straight from the bills you already issue.',
    status: 'partial',
    visual: <LiveDashboard />,
  },
];

export default function Story() {
  return (
    <section id="story" className="overflow-x-clip border-y border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-24 sm:pt-32">
          <SectionIntro
            kicker="From paper to digital"
            title="From paper bill to digital record."
            lead="Four moments in the life of a purchase, and what changes when the bill is digital."
          />
        </div>
        {chapters.map((chapter, index) => (
          <article
            key={chapter.title}
            className={`grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20 ${
              index > 0 ? 'border-t border-border' : ''
            }`}
          >
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <p className="wb-reveal text-xs font-medium tabular-nums text-ink-soft">
                {index + 1} of {chapters.length}
              </p>
              <h3 className={`wb-reveal mt-3 ${subHeading}`} style={delay(60)}>
                {chapter.title}
              </h3>
              <p className="wb-reveal mt-6 max-w-lg text-lg leading-relaxed text-ink-soft" style={delay(120)}>
                {chapter.body}
              </p>
              <div className="wb-reveal mt-6" style={delay(160)}>
                <StatusTag status={chapter.status} />
              </div>
            </div>
            <div className="wb-reveal" style={delay(100)}>
              {chapter.visual}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
